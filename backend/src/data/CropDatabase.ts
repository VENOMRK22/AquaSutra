
export interface CropConfig {
    id: string;
    name: string;
    durationDays: number;
    waterConsumptionMm: number;
    minTemp: number;
    maxTemp: number;
    baseYieldTons: number;
    baseMarketPrice: number; // ₹/Ton
    inputCost: number;       // ₹/Acre
    soilTypes: string[];
    zones: string[];
    isLegume: boolean;
}

// EXTENDED CROP DATABASE (40+ Crops)
export const CROP_DATABASE: CropConfig[] = [
    // --- CEREALS ---
    {
        id: 'rice',
        name: 'Rice',
        durationDays: 140,
        waterConsumptionMm: 1200,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 2.0,
        baseMarketPrice: 28000,
        inputCost: 24000,
        soilTypes: ['Clay', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'maize',
        name: 'Maize',
        durationDays: 110,
        waterConsumptionMm: 500,
        minTemp: 18,
        maxTemp: 35,
        baseYieldTons: 3.0,
        baseMarketPrice: 20000,
        inputCost: 16000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },

    // --- PULSES ---
    {
        id: 'chickpea',
        name: 'Chickpea (Chana)',
        durationDays: 110,
        waterConsumptionMm: 300,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 1.0,
        baseMarketPrice: 55000,
        inputCost: 14000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'kidneybeans',
        name: 'Kidney Beans (Rajma)',
        durationDays: 120,
        waterConsumptionMm: 400,
        minTemp: 15,
        maxTemp: 30,
        baseYieldTons: 0.8,
        baseMarketPrice: 80000,
        inputCost: 18000,
        soilTypes: ['Loamy', 'Sandy'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'pigeonpeas',
        name: 'Pigeon Peas (Tur)',
        durationDays: 180,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 0.8,
        baseMarketPrice: 70000,
        inputCost: 15000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'mothbeans',
        name: 'Moth Beans (Matki)',
        durationDays: 75,
        waterConsumptionMm: 250,
        minTemp: 25,
        maxTemp: 40,
        baseYieldTons: 0.5,
        baseMarketPrice: 60000,
        inputCost: 8000,
        soilTypes: ['Sandy', 'Light'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'mungbean',
        name: 'Mung Bean',
        durationDays: 65,
        waterConsumptionMm: 300,
        minTemp: 25,
        maxTemp: 35,
        baseYieldTons: 0.5,
        baseMarketPrice: 75000,
        inputCost: 8000,
        soilTypes: ['Medium'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'blackgram',
        name: 'Black Gram (Urad)',
        durationDays: 80,
        waterConsumptionMm: 350,
        minTemp: 25,
        maxTemp: 35,
        baseYieldTons: 0.6,
        baseMarketPrice: 70000,
        inputCost: 10000,
        soilTypes: ['Medium', 'Black'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'lentil',
        name: 'Lentil (Masoor)',
        durationDays: 110,
        waterConsumptionMm: 300,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 0.7,
        baseMarketPrice: 65000,
        inputCost: 12000,
        soilTypes: ['Loamy'],
        zones: ['General'],
        isLegume: true
    },

    // --- FRUITS ---
    {
        id: 'pomegranate',
        name: 'Pomegranate',
        durationDays: 180,
        waterConsumptionMm: 1200,
        minTemp: 15,
        maxTemp: 40,
        baseYieldTons: 8.0,
        baseMarketPrice: 80000,
        inputCost: 80000,
        soilTypes: ['Light', 'Medium'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'banana',
        name: 'Banana',
        durationDays: 365,
        waterConsumptionMm: 2200,
        minTemp: 15,
        maxTemp: 40,
        baseYieldTons: 30.0,
        baseMarketPrice: 12000,
        inputCost: 60000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'mango',
        name: 'Mango',
        durationDays: 120,
        waterConsumptionMm: 800,
        minTemp: 10,
        maxTemp: 45,
        baseYieldTons: 6.0,
        baseMarketPrice: 50000,
        inputCost: 30000,
        soilTypes: ['Rocky', 'Laterite'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'grapes',
        name: 'Grapes',
        durationDays: 140,
        waterConsumptionMm: 1000,
        minTemp: 10,
        maxTemp: 40,
        baseYieldTons: 10.0,
        baseMarketPrice: 60000,
        inputCost: 150000,
        soilTypes: ['Light', 'Medium'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'watermelon',
        name: 'Watermelon',
        durationDays: 90,
        waterConsumptionMm: 500,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 20.0,
        baseMarketPrice: 8000,
        inputCost: 25000,
        soilTypes: ['Sandy Loam'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'muskmelon',
        name: 'Muskmelon',
        durationDays: 90,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 15.0,
        baseMarketPrice: 15000,
        inputCost: 25000,
        soilTypes: ['Sandy Loam'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'apple',
        name: 'Apple',
        durationDays: 160,
        waterConsumptionMm: 800,
        minTemp: -5,
        maxTemp: 30,
        baseYieldTons: 12.0,
        baseMarketPrice: 100000,
        inputCost: 80000,
        soilTypes: ['Loamy'],
        zones: ['Cold'],
        isLegume: false
    },
    {
        id: 'orange',
        name: 'Orange',
        durationDays: 240,
        waterConsumptionMm: 1000,
        minTemp: 10,
        maxTemp: 35,
        baseYieldTons: 15.0,
        baseMarketPrice: 25000,
        inputCost: 40000,
        soilTypes: ['Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'papaya',
        name: 'Papaya',
        durationDays: 300,
        waterConsumptionMm: 1500,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 35.0,
        baseMarketPrice: 12000,
        inputCost: 50000,
        soilTypes: ['Well Drained'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'coconut',
        name: 'Coconut',
        durationDays: 365,
        waterConsumptionMm: 1800,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 8.0, // Nuts weight equivalent
        baseMarketPrice: 25000,
        inputCost: 20000,
        soilTypes: ['Sandy', 'Coastal'],
        zones: ['General'],
        isLegume: false
    },

    // --- FIBER/COMMERCIAL ---
    {
        id: 'cotton',
        name: 'Cotton',
        durationDays: 160,
        waterConsumptionMm: 700,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 1.5,
        baseMarketPrice: 60000,
        inputCost: 20000,
        soilTypes: ['Black'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'jute',
        name: 'Jute',
        durationDays: 120,
        waterConsumptionMm: 1000,
        minTemp: 24,
        maxTemp: 38,
        baseYieldTons: 2.0,
        baseMarketPrice: 30000,
        inputCost: 15000,
        soilTypes: ['Alluvial'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'coffee',
        name: 'Coffee',
        durationDays: 240,
        waterConsumptionMm: 1500,
        minTemp: 15,
        maxTemp: 30,
        baseYieldTons: 1.0,
        baseMarketPrice: 150000,
        inputCost: 60000,
        soilTypes: ['Loamy'],
        zones: ['Hilly'],
        isLegume: false
    }
];
