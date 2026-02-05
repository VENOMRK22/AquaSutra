
export interface RiskAssessment {
    riskScore: number;                     // 0-100 (0=safe, 100=extreme risk)
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    factors: RiskFactor[];
    recommendations: string[];
    insuranceRequired: boolean;
}

export interface RiskFactor {
    category: 'WATER' | 'MARKET' | 'CLIMATE' | 'SOIL' | 'INFRASTRUCTURE' | 'FINANCIAL';
    severity: number;                      // 0-100
    description: string;
    impact: string;
}

export interface CropConfigMock {
    id: string;
    waterConsumptionMm: number;
    maxTemp: number;
    soilTypes: string[];
    inputCost: number;
}

export class CropRiskAssessment {

    /**
     * Assess Multi-Factor Risk for a Crop Plan
     */
    static assessRisk(
        crop: CropConfigMock,
        farmContext: {
            blockClassification: string;
            waterAvailability: number;
            soilType: string;
            marketTrend: 'UP' | 'DOWN' | 'STABLE';
            marketVolatility: number;
            waterTableDepth: number;
            previousCropId?: string;
        }
    ): RiskAssessment {
        let riskScore = 20; // Base agricultural baseline risk
        const factors: RiskFactor[] = [];
        const recs: string[] = [];

        // 1. WATER RISK (High Weight)
        const waterRatio = farmContext.waterAvailability / crop.waterConsumptionMm;

        if (waterRatio < 0.6) {
            riskScore += 35;
            factors.push({ category: 'WATER', severity: 90, description: 'Critical water shortage (<60%)', impact: 'Yield loss >40% highly likely' });
        } else if (waterRatio < 0.8) {
            riskScore += 20;
            factors.push({ category: 'WATER', severity: 60, description: 'Insufficient water', impact: 'Yield reduction 15-30%' });
        }

        if (farmContext.blockClassification === 'Over-exploited') {
            riskScore += 25;
            factors.push({ category: 'WATER', severity: 85, description: 'Over-exploited Aquifer', impact: 'Borewell may run dry mid-season' });
        } else if (farmContext.blockClassification === 'Critical') {
            riskScore += 15;
            factors.push({ category: 'WATER', severity: 65, description: 'Critical Zone', impact: 'Strict water rationing needed' });
        }

        // 2. MARKET RISK
        if (farmContext.marketTrend === 'DOWN') {
            riskScore += 20;
            factors.push({ category: 'MARKET', severity: 70, description: 'Falling Market Prices', impact: 'Revenue 10-20% below projection' });
        }
        if (farmContext.marketVolatility > 15) {
            riskScore += 15;
            factors.push({ category: 'MARKET', severity: 55, description: 'High Price Volatility', impact: 'Unpredictable returns' });
        }

        // 3. SOIL & CLIMATE
        // Simple string check for now
        const isCompatible = crop.soilTypes.some(s => farmContext.soilType.toLowerCase().includes(s.toLowerCase()));
        if (!isCompatible) {
            riskScore += 20;
            factors.push({ category: 'SOIL', severity: 65, description: `Incompatible Soil: ${farmContext.soilType}`, impact: 'Poor germination & growth' });
        }

        // 4. INFRASTRUCTURE & FINANCIAL
        if (farmContext.waterTableDepth > 50) { // e.g. 150 ft
            riskScore += 15;
            factors.push({ category: 'INFRASTRUCTURE', severity: 60, description: 'Deep Water Table (>50m)', impact: 'High pumping cost & failure risk' });
        }
        if (crop.inputCost > 50000) {
            riskScore += 10;
            factors.push({ category: 'FINANCIAL', severity: 50, description: 'High Capital Investment', impact: 'Requires working capital/credit' });
        }

        // 5. CROP ROTATION
        if (farmContext.previousCropId === crop.id) {
            riskScore += 12;
            factors.push({ category: 'SOIL', severity: 55, description: 'Monoculture (Same crop repeat)', impact: 'Pest buildup & nutrient depletion' });
        }

        // --- Aggregation ---
        // Cap Score at 99
        riskScore = Math.min(riskScore, 99);

        let riskLevel: RiskAssessment['riskLevel'] = 'LOW';
        if (riskScore >= 75) riskLevel = 'EXTREME';
        else if (riskScore >= 55) riskLevel = 'HIGH';
        else if (riskScore >= 30) riskLevel = 'MEDIUM';

        // Recommendations
        if (riskLevel === 'EXTREME') recs.push("NOT RECOMMENDED for planting", "Consider alternative crop");
        if (riskLevel === 'HIGH' || riskLevel === 'EXTREME') recs.push("Crop Insurance Mandatory", "Reduce planted area");
        if (farmContext.blockClassification === 'Over-exploited') recs.push("Adopt Drip Irrigation");
        if (farmContext.marketTrend === 'DOWN') recs.push("Secure contract selling if possible");

        const insuranceRequired = riskScore > 50 || waterRatio < 0.7 || farmContext.blockClassification === 'Over-exploited';

        return {
            riskScore,
            riskLevel,
            factors,
            recommendations: recs,
            insuranceRequired
        };
    }

    /**
     * Calculate Insurance Premium (PM Fasal Bima Yojana proxy)
     */
    static calculateInsurancePremium(sumInsured: number, riskScore: number): number {
        // Base rate 2% (Khraif) / 1.5% (Rabi) for farmers
        // We add a risk loading factor for "Real Cost" view
        const baseRate = 0.02;
        const riskLoading = (riskScore / 100) * 0.05; // Up to 5% extra loading
        const totalRate = baseRate + riskLoading;
        return Math.round(sumInsured * totalRate);
    }
}
