"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CROP_DATABASE = void 0;
// EXTENDED CROP DATABASE (40+ Crops)
exports.CROP_DATABASE = [
    // --- CEREALS ---
    {
        id: 'rice_basmati',
        name: 'Rice (Basmati)',
        durationDays: 140,
        waterConsumptionMm: 1200,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 1.8,
        baseMarketPrice: 35000,
        inputCost: 25000,
        soilTypes: ['Clay', 'Loamy', 'Alluvial'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'rice_non_basmati',
        name: 'Rice (Indrayani/Kolam)',
        durationDays: 135,
        waterConsumptionMm: 1100,
        minTemp: 22,
        maxTemp: 36,
        baseYieldTons: 2.2,
        baseMarketPrice: 22000,
        inputCost: 22000,
        soilTypes: ['Clay', 'Loamy'],
        zones: ['Konkan', 'Eastern Maharashtra', 'General'],
        isLegume: false
    },
    {
        id: 'wheat_lokwan',
        name: 'Wheat (Lokwan)',
        durationDays: 120,
        waterConsumptionMm: 450,
        minTemp: 10,
        maxTemp: 35,
        baseYieldTons: 1.8,
        baseMarketPrice: 24000,
        inputCost: 18000,
        soilTypes: ['Black', 'Alluvial', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'wheat_sharbati',
        name: 'Wheat (Sharbati)',
        durationDays: 130,
        waterConsumptionMm: 500,
        minTemp: 10,
        maxTemp: 32,
        baseYieldTons: 1.5,
        baseMarketPrice: 38000,
        inputCost: 20000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'jowar_hybrid',
        name: 'Jowar (Sorghum)',
        durationDays: 110,
        waterConsumptionMm: 350,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 1.2,
        baseMarketPrice: 28000,
        inputCost: 12000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Marathwada', 'Western Maharashtra'],
        isLegume: false
    },
    {
        id: 'bajra_hybrid',
        name: 'Bajra (Pearl Millet)',
        durationDays: 90,
        waterConsumptionMm: 250,
        minTemp: 25,
        maxTemp: 40,
        baseYieldTons: 1.0,
        baseMarketPrice: 22000,
        inputCost: 10000,
        soilTypes: ['Medium', 'Sandy Loam'],
        zones: ['Marathwada', 'Northern Maharashtra'],
        isLegume: false
    },
    {
        id: 'maize_rabi',
        name: 'Maize (Rabi)',
        durationDays: 120,
        waterConsumptionMm: 500,
        minTemp: 18,
        maxTemp: 35,
        baseYieldTons: 3.5,
        baseMarketPrice: 21000,
        inputCost: 18000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'maize_kharif',
        name: 'Maize (Kharif)',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 22,
        maxTemp: 38,
        baseYieldTons: 3.0,
        baseMarketPrice: 19000,
        inputCost: 16000,
        soilTypes: ['Medium'],
        zones: ['General'],
        isLegume: false
    },
    // --- PULSES (LEGUMES) ---
    {
        id: 'tur_arhar',
        name: 'Tur (Red Gram)',
        durationDays: 180,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 0.8,
        baseMarketPrice: 70000,
        inputCost: 15000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['Marathwada', 'Vidarbha'],
        isLegume: true
    },
    {
        id: 'gram_chana',
        name: 'Gram (Chana)',
        durationDays: 110,
        waterConsumptionMm: 300,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 0.9,
        baseMarketPrice: 55000,
        inputCost: 14000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'moong_summer',
        name: 'Moong (Summer)',
        durationDays: 65,
        waterConsumptionMm: 300,
        minTemp: 25,
        maxTemp: 40,
        baseYieldTons: 0.5,
        baseMarketPrice: 80000,
        inputCost: 8000,
        soilTypes: ['Medium'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'urad_black_gram',
        name: 'Urad (Black Gram)',
        durationDays: 80,
        waterConsumptionMm: 350,
        minTemp: 22,
        maxTemp: 38,
        baseYieldTons: 0.6,
        baseMarketPrice: 75000,
        inputCost: 10000,
        soilTypes: ['Medium', 'Black'],
        zones: ['Vidarbha', 'Marathwada'],
        isLegume: true
    },
    // --- OILSEEDS ---
    {
        id: 'soybean_js335',
        name: 'Soybean (JS-335)',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 1.0,
        baseMarketPrice: 46000,
        inputCost: 16000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Vidarbha', 'Marathwada', 'Western Maharashtra'],
        isLegume: true
    },
    {
        id: 'groundnut_rabi',
        name: 'Groundnut (Rabi)',
        durationDays: 130,
        waterConsumptionMm: 600,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 1.2,
        baseMarketPrice: 60000,
        inputCost: 22000,
        soilTypes: ['Sandy Loam', 'Light'],
        zones: ['General'],
        isLegume: true // Technically a legume
    },
    {
        id: 'safflower_kardi',
        name: 'Safflower (Kardi)',
        durationDays: 135,
        waterConsumptionMm: 300,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 0.6,
        baseMarketPrice: 45000,
        inputCost: 8000,
        soilTypes: ['Black'],
        zones: ['Marathwada'],
        isLegume: false
    },
    {
        id: 'mustard_rai',
        name: 'Mustard (Rai)',
        durationDays: 110,
        waterConsumptionMm: 300,
        minTemp: 10,
        maxTemp: 30,
        baseYieldTons: 0.7,
        baseMarketPrice: 50000,
        inputCost: 10000,
        soilTypes: ['Loamy', 'Sandy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'sunflower_hybrid',
        name: 'Sunflower (Hybrid)',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 0.8,
        baseMarketPrice: 52000,
        inputCost: 15000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Marathwada'],
        isLegume: false
    },
    // --- CASH CROPS ---
    {
        id: 'sugarcane_1',
        name: 'Sugarcane (Adsali)',
        durationDays: 450, // 15-18 months
        waterConsumptionMm: 2500,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 120, // High yield
        baseMarketPrice: 3150, // Per Ton
        inputCost: 50000, // Per Acre high
        soilTypes: ['Black', 'Clay'],
        zones: ['Western Maharashtra'],
        isLegume: false
    },
    {
        id: 'sugarcane_seasonal',
        name: 'Sugarcane (Seasonal)',
        durationDays: 365,
        waterConsumptionMm: 2000,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 90,
        baseMarketPrice: 3150,
        inputCost: 40000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Western Maharashtra'],
        isLegume: false
    },
    {
        id: 'cotton_bt',
        name: 'Cotton (Bt Hybrid)',
        durationDays: 160,
        waterConsumptionMm: 700,
        minTemp: 22,
        maxTemp: 38,
        baseYieldTons: 1.2, // Kapas
        baseMarketPrice: 65000, // 6500/q
        inputCost: 20000,
        soilTypes: ['Black Cotton Soil'],
        zones: ['Vidarbha', 'Marathwada', 'Khandesh'],
        isLegume: false
    },
    {
        id: 'turmeric_selam',
        name: 'Turmeric (Selam)',
        durationDays: 270,
        waterConsumptionMm: 1500,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 8, // Wet rhizomes
        baseMarketPrice: 7000, // Wet rate? Or dry. Assuming 7000/q dry => 70k/ton. Wet is cheaper. Lets use dry equivalent income.
        inputCost: 40000,
        soilTypes: ['Loamy', 'Black'],
        zones: ['Western Maharashtra'],
        isLegume: false
    },
    {
        id: 'ginger_local',
        name: 'Ginger (Local)',
        durationDays: 240,
        waterConsumptionMm: 1600,
        minTemp: 18,
        maxTemp: 35,
        baseYieldTons: 12,
        baseMarketPrice: 40000, // 4000/q
        inputCost: 60000,
        soilTypes: ['Loamy', 'Well Drained'],
        zones: ['Western Maharashtra'],
        isLegume: false
    },
    // --- VEGETABLES ---
    {
        id: 'onion_red',
        name: 'Onion (Red/Rabi)',
        durationDays: 120,
        waterConsumptionMm: 500,
        minTemp: 15,
        maxTemp: 32,
        baseYieldTons: 12,
        baseMarketPrice: 15000, // 1500/q
        inputCost: 35000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['Nashik', 'Pune'],
        isLegume: false
    },
    {
        id: 'onion_kharif',
        name: 'Onion (Kharif)',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 10,
        baseMarketPrice: 12000,
        inputCost: 30000,
        soilTypes: ['Medium'],
        zones: ['Nashik'],
        isLegume: false
    },
    {
        id: 'tomato_hybrid',
        name: 'Tomato (Hybrid)',
        durationDays: 130, // Transplating to harvest
        waterConsumptionMm: 600,
        minTemp: 18,
        maxTemp: 30,
        baseYieldTons: 25,
        baseMarketPrice: 10000, // 1000/q volatile
        inputCost: 45000,
        soilTypes: ['Medium', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'potato_khufri',
        name: 'Potato (Khufri)',
        durationDays: 90,
        waterConsumptionMm: 400,
        minTemp: 15,
        maxTemp: 25,
        baseYieldTons: 15,
        baseMarketPrice: 12000,
        inputCost: 35000,
        soilTypes: ['Sandy Loam'],
        zones: ['Pune', 'Satara'],
        isLegume: false
    },
    {
        id: 'chili_green',
        name: 'Chili (Green)',
        durationDays: 160,
        waterConsumptionMm: 700,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 8,
        baseMarketPrice: 30000,
        inputCost: 40000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'brinjal_hybrid',
        name: 'Brinjal (Hybrid)',
        durationDays: 150,
        waterConsumptionMm: 800,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 20,
        baseMarketPrice: 15000,
        inputCost: 30000,
        soilTypes: ['Medium'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'okra_bhindi',
        name: 'Okra (Bhindi)',
        durationDays: 90,
        waterConsumptionMm: 450,
        minTemp: 22,
        maxTemp: 38,
        baseYieldTons: 8,
        baseMarketPrice: 25000,
        inputCost: 25000,
        soilTypes: ['Medium'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'cauliflower',
        name: 'Cauliflower',
        durationDays: 85,
        waterConsumptionMm: 400,
        minTemp: 15,
        maxTemp: 25,
        baseYieldTons: 12,
        baseMarketPrice: 15000,
        inputCost: 20000,
        soilTypes: ['Loamy'],
        zones: ['Pune', 'Nashik'],
        isLegume: false
    },
    {
        id: 'cabbage',
        name: 'Cabbage',
        durationDays: 90,
        waterConsumptionMm: 400,
        minTemp: 15,
        maxTemp: 25,
        baseYieldTons: 15,
        baseMarketPrice: 10000,
        inputCost: 18000,
        soilTypes: ['Loamy'],
        zones: ['Pune', 'Nashik'],
        isLegume: false
    },
    // --- FRUITS ---
    {
        id: 'pomegranate_bhagwa',
        name: 'Pomegranate (Bhagwa)',
        durationDays: 200, // Bahar treatment to harvest
        waterConsumptionMm: 1200,
        minTemp: 18,
        maxTemp: 40,
        baseYieldTons: 10, // Per acre mature
        baseMarketPrice: 80000, // 80/kg
        inputCost: 80000,
        soilTypes: ['Light', 'Rocky', 'Med'],
        zones: ['Solapur', 'Nashik', 'Ahmednagar'],
        isLegume: false
    },
    {
        id: 'grapes_thompson',
        name: 'Grapes (Thompson)',
        durationDays: 140, // Pruning to Harvest
        waterConsumptionMm: 1000,
        minTemp: 12,
        maxTemp: 35,
        baseYieldTons: 12,
        baseMarketPrice: 60000,
        inputCost: 150000, // Very high
        soilTypes: ['Light', 'Medium'],
        zones: ['Nashik', 'Sangli'],
        isLegume: false
    },
    {
        id: 'banana_grand_naine',
        name: 'Banana (G-9)',
        durationDays: 365,
        waterConsumptionMm: 2200,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 25,
        baseMarketPrice: 12000, // 12/kg
        inputCost: 60000,
        soilTypes: ['Black', 'Loamy'],
        zones: ['Jalgaon', 'Solapur'],
        isLegume: false
    },
    {
        id: 'mango_kesar',
        name: 'Mango (Kesar)',
        durationDays: 120, // Flowering to harvest
        waterConsumptionMm: 800,
        minTemp: 20,
        maxTemp: 40,
        baseYieldTons: 5,
        baseMarketPrice: 70000,
        inputCost: 30000,
        soilTypes: ['Rocky', 'Laterite'],
        zones: ['Marathwada', 'Konkan'],
        isLegume: false
    },
    {
        id: 'papaya_taiwan',
        name: 'Papaya (Taiwan 786)',
        durationDays: 300,
        waterConsumptionMm: 1500,
        minTemp: 22,
        maxTemp: 40,
        baseYieldTons: 40,
        baseMarketPrice: 10000,
        inputCost: 50000,
        soilTypes: ['Well Drained'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'watermelon_sugar',
        name: 'Watermelon (Sugar Baby)',
        durationDays: 80,
        waterConsumptionMm: 450,
        minTemp: 25,
        maxTemp: 38,
        baseYieldTons: 20,
        baseMarketPrice: 8000,
        inputCost: 25000,
        soilTypes: ['Sandy Loam'],
        zones: ['General'],
        isLegume: false
    }
];
