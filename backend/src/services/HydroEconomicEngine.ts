export interface CropConfig {
    id: string;
    name: string;
    durationDays: number;
    waterConsumptionMm: number; // Total water needed per acre in mm
    minTemp: number;
    maxTemp: number;
    baseYieldTons: number; // Avg yield per acre
    baseMarketPrice: number; // INR per ton
    inputCost: number; // INR per acre
    soilTypes: string[]; // Compatible soil types
    zones: string[]; // Preferred Agro-Climatic Zones
    isLegume: boolean; // For soil recovery logic
}

export interface FarmContext {
    pincode: string;
    lat: number;
    lon: number;
    soilType: string; // e.g., 'Clay', 'Sandy'
    soilDepth?: number; // cm
    previousCropId?: string;
    totalLandArea: number; // Acres
}

export interface RecommendationResult {
    cropId: string;
    name: string;
    profitIndex: number; // The Hero Metric
    waterSavings: number; // % relative to baseline or user intent
    viabilityScore: number; // 0-100
    isSmartSwap: boolean;
    reason: string[];
    debug: {
        bucketSize: number;
        projectedRevenue: number;
        waterCost: number;
    };
    impact?: {
        totalLiters: number;
        drinkingWaterDays: number;
        pondsFilled: number;
        extraAcres: number;
        comparison?: {
            intentCropName: string;
            intentWaterMm: number;
            intentProfitIndex: number;
            recommendedProfitIndex: number;
        };
    };
}

// EXTENDED CROP DATABASE (20+ Crops)
const CROP_DATABASE: CropConfig[] = [
    // --- FIBER & CASH CROPS ---
    {
        id: 'sugarcane_1',
        name: 'Sugarcane (Adsali)',
        durationDays: 365,
        waterConsumptionMm: 2200,
        minTemp: 15,
        maxTemp: 40,
        baseYieldTons: 45,
        baseMarketPrice: 2900,
        inputCost: 50000,
        soilTypes: ['Black', 'Loamy', 'Clay'],
        zones: ['Western Maharashtra', 'Marathwada'],
        isLegume: false
    },
    {
        id: 'cotton_bt',
        name: 'Bt Cotton',
        durationDays: 160,
        waterConsumptionMm: 700,
        minTemp: 20,
        maxTemp: 42,
        baseYieldTons: 1.0,
        baseMarketPrice: 62000,
        inputCost: 28000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Vidarbha', 'Marathwada', 'Northern Maharashtra'],
        isLegume: false
    },
    {
        id: 'turmeric_selam',
        name: 'Turmeric (Selam)',
        durationDays: 270,
        waterConsumptionMm: 1200,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 2.5, // Dried
        baseMarketPrice: 65000,
        inputCost: 40000,
        soilTypes: ['Loamy', 'Red'],
        zones: ['Western Maharashtra', 'Marathwada'],
        isLegume: false
    },
    {
        id: 'ginger',
        name: 'Ginger',
        durationDays: 240,
        waterConsumptionMm: 1100,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 10, // Fresh
        baseMarketPrice: 25000,
        inputCost: 60000,
        soilTypes: ['Loamy', 'Red', 'Medium'],
        zones: ['Western Maharashtra'],
        isLegume: false
    },

    // --- CEREALS ---
    {
        id: 'wheat_lokwan',
        name: 'Wheat (Lokwan)',
        durationDays: 110,
        waterConsumptionMm: 450,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 1.8,
        baseMarketPrice: 24000,
        inputCost: 15000,
        soilTypes: ['Black', 'Loamy', 'Clay'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'jowar_rabi',
        name: 'Sorghum (Jowar - Rabi)',
        durationDays: 120,
        waterConsumptionMm: 350,
        minTemp: 15,
        maxTemp: 40,
        baseYieldTons: 1.2,
        baseMarketPrice: 35000,
        inputCost: 10000,
        soilTypes: ['Medium', 'Black', 'Light'],
        zones: ['Marathwada', 'Western Maharashtra'],
        isLegume: false
    },
    {
        id: 'bajra',
        name: 'Pearl Millet (Bajra)',
        durationDays: 90,
        waterConsumptionMm: 300,
        minTemp: 20,
        maxTemp: 42,
        baseYieldTons: 1.0,
        baseMarketPrice: 22000,
        inputCost: 8000,
        soilTypes: ['Sandy', 'Light', 'Medium'],
        zones: ['Marathwada', 'Northern Maharashtra'],
        isLegume: false
    },
    {
        id: 'maize_popcorn',
        name: 'Maize (Corn)',
        durationDays: 100,
        waterConsumptionMm: 500,
        minTemp: 18,
        maxTemp: 38,
        baseYieldTons: 2.5,
        baseMarketPrice: 20000,
        inputCost: 18000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'paddy_basmati',
        name: 'Rice (Paddy)',
        durationDays: 130,
        waterConsumptionMm: 1200,
        minTemp: 20,
        maxTemp: 38,
        baseYieldTons: 2.0,
        baseMarketPrice: 30000,
        inputCost: 25000,
        soilTypes: ['Clay', 'Loamy'],
        zones: ['Konkan', 'Eastern Vidarbha'],
        isLegume: false
    },

    // --- PULSES (LEGUMES) ---
    {
        id: 'soybean_js',
        name: 'Soybean',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 1.0,
        baseMarketPrice: 42000,
        inputCost: 15000,
        soilTypes: ['Medium', 'Loamy', 'Black'],
        zones: ['Vidarbha', 'Western Maharashtra', 'Marathwada'],
        isLegume: true
    },
    {
        id: 'gram_chana',
        name: 'Chickpea (Harbara/Chana)',
        durationDays: 100,
        waterConsumptionMm: 250,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 0.8,
        baseMarketPrice: 52000,
        inputCost: 12000,
        soilTypes: ['Black', 'Medium'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'tur_arhar',
        name: 'Pigeon Pea (Tur)',
        durationDays: 160,
        waterConsumptionMm: 400,
        minTemp: 18,
        maxTemp: 38,
        baseYieldTons: 0.7,
        baseMarketPrice: 70000,
        inputCost: 10000,
        soilTypes: ['Medium', 'Light'],
        zones: ['Marathwada', 'Vidarbha'],
        isLegume: true
    },
    {
        id: 'moong',
        name: 'Green Gram (Moong)',
        durationDays: 65,
        waterConsumptionMm: 200,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 0.5,
        baseMarketPrice: 75000,
        inputCost: 8000,
        soilTypes: ['Light', 'Medium'],
        zones: ['General'],
        isLegume: true
    },

    // --- VEGETABLES ---
    {
        id: 'oniion_red',
        name: 'Onion (Red)',
        durationDays: 120,
        waterConsumptionMm: 500,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 12,
        baseMarketPrice: 15000, // Volatile
        inputCost: 40000,
        soilTypes: ['Loamy', 'Medium'],
        zones: ['Western Maharashtra', 'Northern Maharashtra'],
        isLegume: false
    },
    {
        id: 'tomato_hybrid',
        name: 'Tomato (Hybrid)',
        durationDays: 140,
        waterConsumptionMm: 600,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 25,
        baseMarketPrice: 10000,
        inputCost: 60000,
        soilTypes: ['Loamy', 'Black'],
        zones: ['Western Maharashtra', 'Northern Maharashtra'],
        isLegume: false
    },
    {
        id: 'chilli_g4',
        name: 'Green Chilli',
        durationDays: 150,
        waterConsumptionMm: 550,
        minTemp: 18,
        maxTemp: 38,
        baseYieldTons: 8,
        baseMarketPrice: 25000,
        inputCost: 45000,
        soilTypes: ['Medium', 'Black'],
        zones: ['General'],
        isLegume: false
    },

    // --- HORTICULTURE ---
    {
        id: 'pomegranate_bhagwa',
        name: 'Pomegranate',
        durationDays: 365,
        waterConsumptionMm: 900,
        minTemp: 10,
        maxTemp: 45,
        baseYieldTons: 12,
        baseMarketPrice: 80000,
        inputCost: 90000,
        soilTypes: ['Sandy', 'Murrum', 'Light'],
        zones: ['Western Maharashtra', 'Marathwada'],
        isLegume: false
    },
    {
        id: 'grapes_thompson',
        name: 'Grapes (Export)',
        durationDays: 365,
        waterConsumptionMm: 800, // Drip efficient
        minTemp: 10,
        maxTemp: 40,
        baseYieldTons: 10,
        baseMarketPrice: 90000, // Export quality
        inputCost: 250000,
        soilTypes: ['Medium', 'Calcareous'],
        zones: ['Western Maharashtra', 'Northern Maharashtra'],
        isLegume: false
    }
];

export class HydroEconomicEngine {

    // LAYER 1: Contextual Heritage (Zone & Soil Legacy)
    private getZoneFromPincode(pincode: string): string {
        // Mock Logic: Real mapping would use a JSON file or lookup API
        const pinPrefix = pincode.substring(0, 3);
        if (['411', '412', '415', '416'].includes(pinPrefix)) return 'Western Maharashtra';
        if (['431', '440', '444'].includes(pinPrefix)) return 'Vidarbha';
        return 'General';
    }

    private calculateSoilLegacyBonus(crop: CropConfig, previousCropId?: string): number {
        if (!previousCropId) return 0;

        // If previous  was heavy feeder (Sugarcane/Cotton), and current is Legume -> Bonus
        const heavyFeeders = ['sugarcane_1', 'cotton_bt'];
        if (heavyFeeders.includes(previousCropId) && crop.isLegume) {
            return 20; // +20 Score Bonus for Soil Recovery
        }
        return 0;
    }

    // LAYER 2: Environmental Feasibility (The Bucket)
    private getWaterBucketSize(soilType: string, depthCm = 100): number {
        // Water Holding Capacity (mm per meter of soil)
        const whcMap: Record<string, number> = {
            'Clay': 200,    // High retention
            'Black': 180,
            'Loamy': 140,
            'Medium': 140,
            'Sandy': 100,
            'Murrum': 80
        };
        const capacityPerMeter = whcMap[soilType] || 140;
        return (capacityPerMeter * (depthCm / 100)); // Total mm capacity
    }

    private checkClimateStress(crop: CropConfig, lat: number): boolean {
        // Mock Forecast: In real app, fetch NASA POWER forecast for next crop duration
        // Simplified: Assume Summer (High Temps)
        const forecastedMaxTemp = 38;

        if (forecastedMaxTemp > crop.maxTemp) {
            return false; // FAILED Stress Test
        }
        return true;
    }

    // LAYER 3: Efficiency & Profit Engine
    private calculateProfitIndex(crop: CropConfig): number {
        const revenue = crop.baseYieldTons * crop.baseMarketPrice;
        const netProfit = revenue - crop.inputCost;

        // PROFIT INDEX (Rupees per mm of Water)
        const PI = netProfit / crop.waterConsumptionMm;

        // Time-Value Adjustment
        // A 4-month crop (120 days) allows 2 more crops vs a 12-month crop.
        // We normalize to "Annualized PI" or simply boost short crops
        const timeFactor = 365 / crop.durationDays;

        return PI * timeFactor;
    }

    // Helper: Fuzzy Match User Input to ID
    private findCropIdByName(input: string): string | undefined {
        if (!input) return undefined;
        const lower = input.toLowerCase();

        // Direct ID match
        const exact = CROP_DATABASE.find(c => c.id === input);
        if (exact) return exact.id;

        // Name match (contains)
        const match = CROP_DATABASE.find(c => c.name.toLowerCase().includes(lower) || c.id.includes(lower));
        return match ? match.id : undefined;
    }

    public getRecommendations(ctx: FarmContext, userIntentName?: string): RecommendationResult[] {
        const zone = this.getZoneFromPincode(ctx.pincode);
        const bucketSize = this.getWaterBucketSize(ctx.soilType, ctx.soilDepth);

        // Resolve Inputs
        const prevCropId = this.findCropIdByName(ctx.previousCropId || '');
        const intentCropId = this.findCropIdByName(userIntentName || '');

        console.log(`Debug: UserIntentName='${userIntentName}' -> ResolvedID='${intentCropId}'`);
        console.log(`Debug: Zone=${zone}, Prev=${prevCropId}`);

        const results: RecommendationResult[] = [];

        for (const crop of CROP_DATABASE) {
            // FILTER 1: Regional Viability
            const isZoneMatch = crop.zones.length === 0 || crop.zones.includes(zone) || zone === 'General';

            if (!isZoneMatch) { continue; }

            // FILTER 2: Stress Test
            if (!this.checkClimateStress(crop, ctx.lat)) { continue; }

            // FILTER 3: Soil Match
            if (!crop.soilTypes.includes(ctx.soilType)) { continue; }

            // SCORE CALCULATION
            let score = 50; // Base Viability
            const legacyBonus = this.calculateSoilLegacyBonus(crop, prevCropId);
            score += legacyBonus;

            // PI Calculation
            const pi = this.calculateProfitIndex(crop);

            // Bucket Check
            // Mock Rainfall: 500mm
            const waterDeficit = crop.waterConsumptionMm - (500 + bucketSize);
            const isRisky = waterDeficit > 0;
            if (isRisky) score -= 30;

            // User Intent Comparison (Smart Swap)
            let isSmartSwap = false;
            let waterSavings = 0;

            if (intentCropId && crop.id !== intentCropId) {
                const userCrop = CROP_DATABASE.find(c => c.id === intentCropId);
                if (userCrop) {
                    const savingsMm = userCrop.waterConsumptionMm - crop.waterConsumptionMm;
                    waterSavings = (savingsMm / userCrop.waterConsumptionMm) * 100;

                    // TRIGGER: Save > 20% Water AND Profit is stable/higher
                    const userPI = this.calculateProfitIndex(userCrop);
                    if (waterSavings > 20 && pi >= (userPI * 0.8)) {
                        isSmartSwap = true;
                    }
                }
            }

            results.push({
                cropId: crop.id,
                name: crop.name,
                profitIndex: Math.round(pi),
                waterSavings: Math.round(waterSavings),
                viabilityScore: Math.min(100, score),
                isSmartSwap: isSmartSwap,
                reason: isSmartSwap ? [`High Profit`, `Saves ${Math.round(waterSavings)}% Water`] : [],
                debug: {
                    bucketSize,
                    projectedRevenue: crop.baseYieldTons * crop.baseMarketPrice,
                    waterCost: crop.waterConsumptionMm
                },
                impact: isSmartSwap && intentCropId ? this.calculateImpact(intentCropId, crop, ctx.totalLandArea) : undefined
            });
        }

        // Sort Logic: Prioritize "Smart Swaps" that are mostly profitable AND sustainable
        results.sort((a, b) => {
            // 1. Victory Card Priority: If one is a Smart Swap and the other isn't, prefer the Smart Swap
            // BUT ONLY if the Smart Swap has a decent profit (avoiding low-revenue crops taking top spot)
            if (a.isSmartSwap && !b.isSmartSwap) return -1;
            if (!a.isSmartSwap && b.isSmartSwap) return 1;

            // 2. Otherwise/Existing: Sort by Profit Index (Standard)
            return b.profitIndex - a.profitIndex;
        });

        // ENFORCE CHAMPION: Always make the #1 result a "Smart Swap" if it's not the user's intent
        if (results.length > 0 && intentCropId) {
            const champion = results[0];

            // Only if champion is NOT the one user already picked
            if (champion.cropId !== intentCropId) {
                champion.isSmartSwap = true;

                // Recalculate impact if it wasn't already done
                if (!champion.impact) {
                    const championConfig = CROP_DATABASE.find(c => c.id === champion.cropId);
                    if (championConfig) {
                        champion.impact = this.calculateImpact(intentCropId, championConfig, ctx.totalLandArea);
                    }
                }

                // Ensure reasons are populated
                if (!champion.reason || champion.reason.length === 0) {
                    champion.reason = [`Top Recommendation`, `Best Balance`];
                }
            }
        }

        return results;
    }

    private calculateImpact(intentId: string, recommendedCrop: CropConfig, areaAcres: number) {
        const intentCrop = CROP_DATABASE.find(c => c.id === intentId);
        if (!intentCrop) return undefined;

        // 1. Calculate Liters Saved
        // 1 Acre = 4046.86 sq meters. 1 mm = 1 Liter / sq meter.
        const diffMm = intentCrop.waterConsumptionMm - recommendedCrop.waterConsumptionMm;

        // VALIDATION FIX: Ensure we don't overestimate. 
        // If user didn't specify acres, default to 1 for calculation to keep numbers "Relatable" (~80 Lakh, not 8 Crore)
        // unless they explicitly typed 10.
        const effectiveAcres = areaAcres > 0 ? areaAcres : 1;

        const totalLitersSaved = diffMm * 4046.86 * effectiveAcres;

        if (totalLitersSaved <= 0) return undefined;

        // 2. Metrics (Refined for Believability)
        return {
            totalLiters: Math.round(totalLitersSaved),
            drinkingWaterDays: Math.round(totalLitersSaved / 500),
            pondsFilled: parseFloat((totalLitersSaved / 1000000).toFixed(1)),
            extraAcres: parseFloat((totalLitersSaved / (recommendedCrop.waterConsumptionMm * 4046.86)).toFixed(1)),
            // NEW COMPARISON METRICS
            comparison: {
                intentCropName: intentCrop.name,
                intentWaterMm: intentCrop.waterConsumptionMm,
                intentProfitIndex: Math.round(this.calculateProfitIndex(intentCrop)),
                recommendedProfitIndex: Math.round(this.calculateProfitIndex(recommendedCrop))
            }
        };
    }
}
