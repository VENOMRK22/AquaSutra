
export interface WaterCostBreakdown {
    electricityCost: number;           // ₹
    dieselCost: number;                // ₹
    borewellMaintenance: number;       // ₹
    pumpDepreciation: number;          // ₹
    totalCostPerMm: number;            // ₹/mm (Absolute cost to pump 1mm water over 1 acre)
    totalCostSeason: number;           // ₹
    totalWaterLiters: number;
    powerRequiredKWh: number;
    dieselRequiredLiters: number;
}

export interface PumpConfiguration {
    type: 'ELECTRIC' | 'DIESEL' | 'HYBRID' | 'SOLAR';
    horsepower: number;
    efficiency: number;                // 0-1 (0.7 = 70%)
    ageYears: number;
}

export interface CropConfigMock { // Simplified for this calculator if full config not imported
    baseYieldTons: number;
    inputCost: number;
    waterConsumptionMm: number;
    durationDays: number;
}

export class WaterCostCalculator {
    // Constants (Regional: UP/Maharashtra Blend)
    private static ELECTRIC_RATE_PER_KWH = 7.5; // Commercial Agri Rate
    private static DIESEL_RATE_PER_LITER = 95.0;
    private static BOREWELL_ANNUAL_MAINTENANCE = 12000;
    private static PUMP_COST_5HP = 45000;
    private static PUMP_LIFE_YEARS = 10;

    // Physics Constants
    private static LITERS_PER_MM_ACRE = 4046.86; // 1 acre = 4046.86 sqm * 1mm (1L)

    /**
     * Calculate comprehensive cost of water extraction
     */
    static calculateWaterCost(
        waterRequirementMm: number,
        areaAcres: number,
        pumpType: 'ELECTRIC' | 'DIESEL' | 'HYBRID' | 'SOLAR',
        waterTableDepthM: number,
        pumpConfig: PumpConfiguration = { type: 'ELECTRIC', horsepower: 5, efficiency: 0.65, ageYears: 5 }
    ): WaterCostBreakdown {

        // Validate Inputs to prevent NaN
        const safeReq = isNaN(waterRequirementMm) ? 0 : waterRequirementMm;
        const safeArea = isNaN(areaAcres) ? 1 : areaAcres;
        const safeDepth = isNaN(waterTableDepthM) ? 20 : waterTableDepthM;
        let safeEfficiency = pumpConfig.efficiency || 0.65;
        if (safeEfficiency <= 0) safeEfficiency = 0.65; // Prevent division by zero

        // Step 1: Total Volume
        const totalLiters = safeReq * this.LITERS_PER_MM_ACRE * safeArea;

        // Step 2: Energy Required (Physics)
        const dynamicHead = safeDepth * 1.2; // 20% head loss
        const theoreticalEnergyJ = totalLiters * 9.81 * dynamicHead;
        const theoreticalKWh = theoreticalEnergyJ / 3600000;

        const powerRequiredKWh = theoreticalKWh / safeEfficiency;

        // Step 3: Energy Cost Calculation
        let electricityCost = 0;
        let dieselCost = 0;
        let dieselRequiredLiters = 0;

        switch (pumpType) {
            case 'ELECTRIC':
                electricityCost = powerRequiredKWh * this.ELECTRIC_RATE_PER_KWH;
                break;

            case 'DIESEL':
                // Diesel GenSet Efficiency: ~3 kWh per Liter of Diesel
                dieselRequiredLiters = powerRequiredKWh / 3.0;
                dieselCost = dieselRequiredLiters * this.DIESEL_RATE_PER_LITER;
                break;

            case 'HYBRID':
                // 60% Electric, 40% Diesel (Load Shedding Scenario)
                electricityCost = (powerRequiredKWh * 0.6) * this.ELECTRIC_RATE_PER_KWH;
                dieselRequiredLiters = (powerRequiredKWh * 0.4) / 3.0;
                dieselCost = dieselRequiredLiters * this.DIESEL_RATE_PER_LITER;
                break;

            case 'SOLAR':
                // Almost zero opex, but we factor in a small maintenance fee equivalent
                electricityCost = powerRequiredKWh * 0.5; // Token maintenance cost
                break;
        }

        // Step 4: Fixed Costs (Amortized per Season)
        const maintenancePerSeason = this.BOREWELL_ANNUAL_MAINTENANCE / 3;
        const depreciationPerSeason = (this.PUMP_COST_5HP / this.PUMP_LIFE_YEARS) / 3;

        const totalCostSeason = electricityCost + dieselCost + maintenancePerSeason + depreciationPerSeason;

        // Fix for NaN if requirement is 0
        const totalCostPerMm = safeReq > 0 ? (totalCostSeason / safeReq) : 0;

        return {
            electricityCost: Math.round(electricityCost),
            dieselCost: Math.round(dieselCost),
            borewellMaintenance: Math.round(maintenancePerSeason),
            pumpDepreciation: Math.round(depreciationPerSeason),
            totalCostPerMm: parseFloat(totalCostPerMm.toFixed(2)),
            totalCostSeason: Math.round(totalCostSeason),
            totalWaterLiters: Math.round(totalLiters),
            powerRequiredKWh: parseFloat(powerRequiredKWh.toFixed(1)),
            dieselRequiredLiters: parseFloat(dieselRequiredLiters.toFixed(1))
        };
    }

    /**
     * Calculate True Profit Index (Profit Per Drop)
     */
    static calculateTrueProfitIndex(
        crop: CropConfigMock,
        marketPricePerTon: number,
        waterTableDepthM: number,
        pumpType: 'ELECTRIC' | 'DIESEL' | 'HYBRID' = 'ELECTRIC'
    ): number {

        const revenue = crop.baseYieldTons * marketPricePerTon;
        const waterCost = this.calculateWaterCost(crop.waterConsumptionMm, 1, pumpType, waterTableDepthM);
        const totalInputCost = crop.inputCost + waterCost.totalCostSeason;
        const netProfit = revenue - totalInputCost;

        if (crop.waterConsumptionMm <= 0) return 0;

        const profitPerMm = netProfit / crop.waterConsumptionMm;
        const timeFactor = 365 / crop.durationDays;

        return parseFloat((profitPerMm * timeFactor).toFixed(2));
    }

    /**
     * Comparison Tool for Frontend
     */
    static comparePumpTypes(waterRequirement: number, waterDepth: number, area: number): any {
        return {
            electric: this.calculateWaterCost(waterRequirement, area, 'ELECTRIC', waterDepth),
            diesel: this.calculateWaterCost(waterRequirement, area, 'DIESEL', waterDepth),
            solar: this.calculateWaterCost(waterRequirement, area, 'SOLAR', waterDepth)
        };
    }
}
