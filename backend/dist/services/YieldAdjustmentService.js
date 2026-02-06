"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YieldAdjustmentService = void 0;
class YieldAdjustmentService {
    static adjustYieldForWaterStress(baseYield, waterRequired, waterAvailable, cropType) {
        let waterRatio = waterAvailable / waterRequired;
        if (waterRatio > 1.2)
            waterRatio = 1.2; // Cap excess benefit
        if (waterRatio < 0)
            waterRatio = 0;
        let yieldFactor = 0;
        // Linear Interpolation on Stress Curve
        const waterPercent = Math.min(Math.round(waterRatio * 100), 100);
        // Find bounding keys (e.g. 70 and 80 for 75%)
        const curve = this.STRESS_CURVES[cropType];
        const lowerBound = Math.floor(waterPercent / 10) * 10;
        const upperBound = Math.ceil(waterPercent / 10) * 10;
        if (lowerBound < 30) {
            yieldFactor = 0.05; // Crop failure
        }
        else if (lowerBound === upperBound) {
            yieldFactor = curve[lowerBound] || 0.1;
        }
        else {
            const valLow = curve[lowerBound] || 0.1;
            const valHigh = curve[upperBound] || 0.1;
            // Interpolate
            yieldFactor = valLow + ((waterPercent - lowerBound) / (upperBound - lowerBound)) * (valHigh - valLow);
        }
        const adjustedYield = baseYield * yieldFactor;
        const reductionPercent = ((baseYield - adjustedYield) / baseYield) * 100;
        // Determine Severity
        let severity = 'NONE';
        const recs = [];
        if (waterRatio >= 0.9) {
            severity = 'NONE';
        }
        else if (waterRatio >= 0.75) {
            severity = 'MILD';
            recs.push("Use mulching to conserve moisture (~15% saving)", "Monitor soil moisture weekly");
        }
        else if (waterRatio >= 0.6) {
            severity = 'MODERATE';
            recs.push("Switch to Drip Irrigation mandatory", "Reduce plant density by 20%");
        }
        else if (waterRatio >= 0.4) {
            severity = 'SEVERE';
            recs.push("Critical water shortage!", "Life-saving irrigation only", "Consider harvesting early for fodder");
        }
        else {
            severity = 'EXTREME';
            recs.push("DO NOT PLANT", "Crop failure highly likely", "Select alternative drought-resistant crop");
        }
        return {
            baseYield,
            adjustedYield: parseFloat(adjustedYield.toFixed(2)),
            reductionPercent: parseFloat(reductionPercent.toFixed(1)),
            waterRatio: parseFloat(waterRatio.toFixed(2)),
            stressSeverity: severity,
            recommendations: recs
        };
    }
    static getCropCategory(cropId) {
        const id = cropId.toLowerCase();
        if (id.includes('sugarcane') || id.includes('cotton'))
            return 'CASH_CROP';
        if (id.includes('gram') || id.includes('tur') || id.includes('moong') || id.includes('soybean'))
            return 'PULSE';
        if (id.includes('onion') || id.includes('tomato') || id.includes('potato') || id.includes('chilli'))
            return 'VEGETABLE';
        if (id.includes('pomegranate') || id.includes('grapes') || id.includes('mango'))
            return 'HORTICULTURE';
        return 'CEREAL'; // Default (Wheat, Rice, Maize, Bajra)
    }
    static predictYieldRange(baseYield, cropType, historicalRainfall) {
        // Simplified Stochastic Model
        // Calculate Coefficient of Variation (CV) of rainfall
        const mean = historicalRainfall.reduce((a, b) => a + b, 0) / historicalRainfall.length;
        // Simple heuristic: +/- 20% volatility for rainfed, +/- 5% for irrigated
        return {
            min: baseYield * 0.8,
            likely: baseYield,
            max: baseYield * 1.1
        };
    }
}
exports.YieldAdjustmentService = YieldAdjustmentService;
// Stress Response Curves (Simplified FAO Ky Logic)
// Key: Water % Availability, Value: Yield Factor (0-1)
YieldAdjustmentService.STRESS_CURVES = {
    'CEREAL': {
        100: 1.00, 90: 0.95, 80: 0.88, 70: 0.78, 60: 0.65, 50: 0.48, 40: 0.28, 30: 0.10
    },
    'CASH_CROP': {
        100: 1.00, 90: 0.92, 80: 0.82, 70: 0.68, 60: 0.50, 50: 0.28, 40: 0.12, 30: 0.05
    },
    'PULSE': {
        100: 1.00, 90: 0.96, 80: 0.91, 70: 0.84, 60: 0.75, 50: 0.62, 40: 0.45, 30: 0.25
    },
    'VEGETABLE': {
        100: 1.00, 90: 0.94, 80: 0.85, 70: 0.73, 60: 0.58, 50: 0.38, 40: 0.18, 30: 0.05
    },
    'HORTICULTURE': {
        100: 1.00, 90: 0.93, 80: 0.84, 70: 0.71, 60: 0.54, 50: 0.32, 40: 0.15, 30: 0.05
    }
};
