"use strict";
// Physics Constants for Profit-Per-Drop
Object.defineProperty(exports, "__esModule", { value: true });
exports.TECH_FACTORS = exports.SOIL_FACTORS = exports.CROP_BENCHMARKS = void 0;
exports.CROP_BENCHMARKS = {
    'Sugarcane': { name: 'Sugarcane', standard_yield: 40, yield_unit: 'Ton', water_need_mm: 2000 },
    'Cotton': { name: 'Cotton', standard_yield: 10, yield_unit: 'Quintal', water_need_mm: 700 },
    'Wheat': { name: 'Wheat', standard_yield: 20, yield_unit: 'Quintal', water_need_mm: 500 },
    'Rice': { name: 'Rice', standard_yield: 25, yield_unit: 'Quintal', water_need_mm: 1200 },
    'Maize': { name: 'Maize', standard_yield: 25, yield_unit: 'Quintal', water_need_mm: 600 },
    'Tomato': { name: 'Tomato', standard_yield: 30, yield_unit: 'Ton', water_need_mm: 600 }
};
exports.SOIL_FACTORS = {
    'Clay': { porosity: 0.9, fertility: 1.0 }, // Retains water, standard yield
    'Black': { porosity: 0.9, fertility: 1.2 }, // Retains water, HIGH yield
    'Loamy': { porosity: 1.0, fertility: 1.0 }, // Standard
    'Sandy': { porosity: 1.4, fertility: 0.8 } // Leaches water, low yield
};
exports.TECH_FACTORS = {
    'Flood': 1.2, // 20% Wastage
    'Drip': 0.7, // 30% Savings
    'Mulch': 0.9 // 10% Savings
};
