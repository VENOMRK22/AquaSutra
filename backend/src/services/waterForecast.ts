import axios from 'axios';
import { apiCache } from '../utils/cache';

// --- Interfaces ---
interface DailySimulation {
    day: number;
    date: string;
    rain_mm: number;
    et_mm: number; // Crop-adjusted evapotranspiration
    balance_mm: number;
    status: 'Normal' | 'Stress' | 'Runoff' | 'Dead';
}

interface ForecastResult {
    simulation: DailySimulation[];
    summary: {
        totalRain: number;
        totalConsumption: number;
        daysStress: number;
        daysRunoff: number;
        firstStressDay: number | null;
        finalBalance: number;
    };
    config: {
        soilCapacity_mm: number;
        wiltingPoint_mm: number;
        selectedCrop: string;
        kc_peak: number;
    };
}

// --- Constants ---
const SEEPAGE_LOSS_MM_PER_DAY = 0.5; // Deep percolation loss

// Soil capacity is FIXED per soil type. Plants don't change how much water soil holds.
const SOIL_CAPACITY: { [key: string]: { max: number; wilting: number } } = {
    'black': { max: 200, wilting: 40 },    // Clay/Black soil holds most water
    'medium black': { max: 180, wilting: 35 },
    'red': { max: 120, wilting: 25 },
    'loamy': { max: 150, wilting: 30 },
    'sandy': { max: 80, wilting: 15 },     // Sandy soil holds least water
    'default': { max: 150, wilting: 30 }
};

// Crop Coefficient (Kc) determines how FAST the crop drinks water.
// LOWER Kc = slower water use = water lasts longer.
// HIGHER Kc = faster water use = water drains quickly.
const CROP_KC: { [key: string]: { kc_ini: number; kc_mid: number; kc_end: number } } = {
    'very low': { kc_ini: 0.3, kc_mid: 0.5, kc_end: 0.4 },   // Millet, Bajra
    'low': { kc_ini: 0.4, kc_mid: 0.7, kc_end: 0.5 },   // Pulses, Groundnut
    'moderate': { kc_ini: 0.5, kc_mid: 1.0, kc_end: 0.7 },   // Wheat, Soybean
    'high': { kc_ini: 0.6, kc_mid: 1.25, kc_end: 0.9 }   // Sugarcane, Rice, Banana
};

/**
 * Get Kc for a specific day based on crop growth stage.
 * Initial (Day 0-30): kc_ini
 * Development (Day 31-60): linear transition to kc_mid
 * Mid-Season (Day 61-120): kc_mid
 * Late-Season (Day 121-180): linear transition to kc_end
 */
function getKcForDay(day: number, crop: { kc_ini: number; kc_mid: number; kc_end: number }): number {
    if (day <= 30) return crop.kc_ini;
    if (day <= 60) return crop.kc_ini + ((crop.kc_mid - crop.kc_ini) * (day - 30) / 30);
    if (day <= 120) return crop.kc_mid;
    return crop.kc_mid + ((crop.kc_end - crop.kc_mid) * (day - 120) / 60);
}

// --- Main Simulation Function ---
export const runWaterSimulation = async (
    lat: number,
    lon: number,
    soilType: string,
    cropCategory: string,
    interventions: string[] = [] // ['drip', 'mulch']
): Promise<ForecastResult> => {

    const cacheKey = `forecast_v3_${lat.toFixed(2)}_${lon.toFixed(2)}_${cropCategory}_${soilType}_${interventions.join('-')}`;
    const cached = apiCache.get<ForecastResult>(cacheKey);
    if (cached) {
        console.log(`[Forecast] Cache HIT: ${cacheKey}`);
        return cached;
    }

    console.log(`[Forecast] Running simulation: Lat=${lat}, Lon=${lon}, Soil=${soilType}, Crop=${cropCategory}, Interventions=${interventions}`);

    // Efficiency Factors
    // Drip: Saves ~40% water (Efficiency 0.6)
    // Mulch: Saves ~20% water (Efficiency 0.8)
    let efficiencyFactor = 1.0;
    if (interventions.includes('drip')) efficiencyFactor *= 0.6;
    if (interventions.includes('mulch')) efficiencyFactor *= 0.8;

    // 1. Determine FIXED Soil Capacity (This is location-based, NOT crop-based)
    const soilKey = Object.keys(SOIL_CAPACITY).find(k => soilType.toLowerCase().includes(k)) || 'default';
    const soilConfig = SOIL_CAPACITY[soilKey];
    const soilCapacity_mm = soilConfig.max;
    const wiltingPoint_mm = soilConfig.wilting;

    console.log(`[Forecast] Soil: ${soilKey} -> Capacity=${soilCapacity_mm}mm, Wilting=${wiltingPoint_mm}mm`);

    // 2. Determine Crop Kc (This affects how fast water is consumed)
    const cropKey = cropCategory.toLowerCase().trim();
    const cropConfig = CROP_KC[cropKey] || CROP_KC['moderate'];

    console.log(`[Forecast] Crop: ${cropKey} -> Kc_mid=${cropConfig.kc_mid}`);

    // 3. Fetch Weather Data
    const simulationDays = 180;
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    let dailyRain: number[] = new Array(simulationDays).fill(0);
    let dailyET0: number[] = new Array(simulationDays).fill(4); // Default 4mm/day if fetch fails

    try {
        // A. Forecast (Days 1-15)
        const forecastRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: lat, longitude: lon,
                daily: 'precipitation_sum,et0_fao_evapotranspiration',
                forecast_days: 15, timezone: 'auto'
            }
        });

        if (forecastRes.data.daily) {
            (forecastRes.data.daily.precipitation_sum || []).forEach((v: number, i: number) => { dailyRain[i] = v || 0; });
            (forecastRes.data.daily.et0_fao_evapotranspiration || []).forEach((v: number, i: number) => { dailyET0[i] = v || 4; });
        }

        // B. Historical Climatology (Days 16-180) - Use last year's data as proxy
        const histStart = new Date(today);
        histStart.setFullYear(today.getFullYear() - 1);
        histStart.setDate(today.getDate() + 16);
        const histEnd = new Date(histStart);
        histEnd.setDate(histStart.getDate() + (180 - 16));

        const histRes = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
            params: {
                latitude: lat, longitude: lon,
                start_date: formatDate(histStart), end_date: formatDate(histEnd),
                daily: 'precipitation_sum,et0_fao_evapotranspiration', timezone: 'auto'
            }
        });

        if (histRes.data.daily) {
            (histRes.data.daily.precipitation_sum || []).forEach((v: number, i: number) => {
                if (16 + i < simulationDays) dailyRain[16 + i] = v || 0;
            });
            (histRes.data.daily.et0_fao_evapotranspiration || []).forEach((v: number, i: number) => {
                if (16 + i < simulationDays) dailyET0[16 + i] = v || 4;
            });
        }

        // Log rain summary
        const totalExpectedRain = dailyRain.reduce((a, b) => a + b, 0);
        const rainyDays = dailyRain.filter(r => r > 0).length;
        console.log(`[Forecast] Weather Data Loaded: Total Rain=${totalExpectedRain.toFixed(0)}mm over ${rainyDays} rainy days`);

    } catch (err: any) {
        console.error('[Forecast] Weather API Error:', err.message);
    }

    // 4. Run the Daily Simulation Loop
    let balance = soilCapacity_mm * 0.6; // Start at 60% capacity
    const simulation: DailySimulation[] = [];
    let totalRain = 0, totalConsumption = 0, daysStress = 0, daysRunoff = 0;
    let firstStressDay: number | null = null;

    for (let day = 0; day < simulationDays; day++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + day);

        const rain = dailyRain[day];
        const et0 = dailyET0[day];
        const kc = getKcForDay(day, cropConfig);

        // Calculate crop water demand (ETc) = ET0 * Kc
        let et_crop = et0 * kc;

        // Physics: Can't lose more water than is available above wilting point
        const availableWater = Math.max(0, balance - wiltingPoint_mm);

        // Apply Interventions: Reduce the "Burn Rate"
        const adjustedBurn = (et_crop * efficiencyFactor) + SEEPAGE_LOSS_MM_PER_DAY;

        const actualLoss = Math.min(adjustedBurn, availableWater);

        // Update balance
        let newBalance = balance + rain - actualLoss;

        // Enforce constraints
        let status: DailySimulation['status'] = 'Normal';

        // Cap at soil capacity (runoff)
        if (newBalance > soilCapacity_mm) {
            daysRunoff++;
            status = 'Runoff';
            newBalance = soilCapacity_mm;
        }

        // Check for stress (below wilting point)
        if (newBalance <= wiltingPoint_mm) {
            daysStress++;
            status = balance <= 0 ? 'Dead' : 'Stress';
            if (firstStressDay === null) firstStressDay = day + 1;
            // Floor at zero
            if (newBalance < 0) newBalance = 0;
        }

        balance = newBalance;
        totalRain += rain;
        totalConsumption += actualLoss;

        simulation.push({
            day: day + 1,
            date: formatDate(currentDate),
            rain_mm: Math.round(rain * 10) / 10,
            et_mm: Math.round(actualLoss * 10) / 10,
            balance_mm: Math.round(balance * 10) / 10,
            status
        });
    }

    const result: ForecastResult = {
        simulation,
        summary: {
            totalRain: Math.round(totalRain),
            totalConsumption: Math.round(totalConsumption),
            daysStress,
            daysRunoff,
            firstStressDay,
            finalBalance: Math.round(balance)
        },
        config: {
            soilCapacity_mm,
            wiltingPoint_mm,
            selectedCrop: cropCategory,
            kc_peak: cropConfig.kc_mid
        }
    };

    // Cache for 3 hours
    apiCache.set(cacheKey, result, 60 * 60 * 3);

    return result;
};
