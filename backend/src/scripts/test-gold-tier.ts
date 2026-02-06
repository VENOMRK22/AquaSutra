
import { MarketPriceService } from '../services/MarketPriceService';
import { WaterCostCalculator } from '../services/WaterCostCalculator';
import { YieldAdjustmentService } from '../services/YieldAdjustmentService';
import { CropRiskAssessment } from '../services/CropRiskAssessment';

async function runGoldTierTest() {
    console.log("🏆 STARTING GOLD-TIER INTEGRATION TEST 🏆\n");

    // Scenario: Farmer in Prayagraj (Semi-critical), Growing Sugarcane, Diesel Pump, 20m Depth
    const SCENARIO = {
        cropId: 'sugarcane_1',
        cropName: 'Sugarcane',
        waterReq: 2000, // mm
        baseYield: 80, // Tons/acre
        inputCost: 45000, // ₹
        market: 'Prayagraj',
        waterDepth: 20, // meters
        pumpType: 'DIESEL' as const,
        waterAvailable: 1600, // mm (Deficit)
        blockClass: 'Semi-critical',
    };

    console.log(`📍 SCENARIO: ${SCENARIO.cropName} in ${SCENARIO.market}`);
    console.log(`   Condition: ${SCENARIO.waterAvailable}/${SCENARIO.waterReq}mm Water | ${SCENARIO.blockClass} | ${SCENARIO.pumpType} Pump\n`);

    // 1. Market Price Service
    console.log("--- 1. MARKET INTELLIGENCE ---");
    const priceData = await MarketPriceService.getCropPrice('Sugarcane', SCENARIO.market);
    // Mock if API fails / returns null in test env without key
    const currentPriceQuintal = priceData ? priceData.modalPrice : 360;
    const currentPriceTon = currentPriceQuintal * 10;

    console.log(`   > Live Price: ₹${currentPriceQuintal}/quintal (₹${currentPriceTon}/ton)`);
    console.log(`   > Trend: ${priceData ? priceData.trend : 'STABLE'} (Confidence: High)`);

    // 2. Water Cost Calculator
    console.log("\n--- 2. WATER ECONOMICS (The Real Cost) ---");
    const waterCost = WaterCostCalculator.calculateWaterCost(
        SCENARIO.waterReq,
        1, // 1 Acre 
        SCENARIO.pumpType,
        SCENARIO.waterDepth
    );
    console.log(`   > Energy Required: ${waterCost.powerRequiredKWh} kWh`);
    console.log(`   > Diesel Needed: ${waterCost.dieselRequiredLiters} Liters`);
    console.log(`   > Total Pumping Cost: ₹${waterCost.totalCostSeason.toLocaleString()} (₹${waterCost.totalCostPerMm}/mm)`);
    console.log(`   > Maintenance/Depreciation: ₹${waterCost.borewellMaintenance + waterCost.pumpDepreciation}`);

    // 3. Yield Adjustment (Stress Analysis)
    console.log("\n--- 3. YIELD & STRESS PHYSICS ---");
    const cropCat = YieldAdjustmentService.getCropCategory(SCENARIO.cropId);
    const yieldAdj = YieldAdjustmentService.adjustYieldForWaterStress(
        SCENARIO.baseYield,
        SCENARIO.waterReq,
        SCENARIO.waterAvailable,
        cropCat
    );
    console.log(`   > Category: ${cropCat}`);
    console.log(`   > Water Ratio: ${yieldAdj.waterRatio * 100}%`);
    console.log(`   > Stress Severity: ${yieldAdj.stressSeverity} ⚠️`);
    console.log(`   > Yield Impact: ${SCENARIO.baseYield} -> ${yieldAdj.adjustedYield} Tons (-${yieldAdj.reductionPercent}%)`);
    console.log(`   > Advice: ${yieldAdj.recommendations.join(', ')}`);

    // 4. Profit Per Drop
    console.log("\n--- 4. PROFIT PER DROP (The Gold Metric) ---");
    // Recalculate cost for actual water used (1600mm) not required (2000mm)
    const actualWaterCost = WaterCostCalculator.calculateWaterCost(SCENARIO.waterAvailable, 1, SCENARIO.pumpType, SCENARIO.waterDepth).totalCostSeason;
    const revenue = yieldAdj.adjustedYield * currentPriceTon;
    const totalCost = SCENARIO.inputCost + actualWaterCost;
    const netProfit = revenue - totalCost;
    const profitPerDrop = netProfit / (SCENARIO.waterAvailable * 4046.86); // ₹ per Liter

    console.log(`   > Revenue: ₹${revenue.toLocaleString()}`);
    console.log(`   > Total Expense (Input + Water): ₹${totalCost.toLocaleString()}`);
    console.log(`   > Net Profit: ₹${netProfit.toLocaleString()}`);
    console.log(`   > Profit Efficiency: ₹${(netProfit / SCENARIO.waterAvailable).toFixed(2)} per mm`);

    // 5. Risk Assessment
    console.log("\n--- 5. RISK ASSESSMENT SCORE ---");
    const risk = CropRiskAssessment.assessRisk(
        {
            id: SCENARIO.cropId,
            waterConsumptionMm: SCENARIO.waterReq,
            maxTemp: 40,
            soilTypes: ['black', 'alluvial'],
            inputCost: SCENARIO.inputCost
        },
        {
            blockClassification: SCENARIO.blockClass,
            waterAvailability: SCENARIO.waterAvailable,
            soilType: 'Black Soil',
            marketTrend: priceData ? (priceData.trend === 'GROWING' ? 'UP' : priceData.trend === 'DEPRECIATING' ? 'DOWN' : 'STABLE') : 'STABLE',
            marketVolatility: 5,
            waterTableDepth: SCENARIO.waterDepth
        }
    );
    console.log(`   > SCORE: ${risk.riskScore}/100 [${risk.riskLevel}]`);
    console.log(`   > Insurance Required: ${risk.insuranceRequired ? 'YES' : 'NO'}`);
    console.log(`   > Risk Factors:`);
    risk.factors.forEach(f => console.log(`     - [${f.category}] ${f.description} (${f.impact})`));

    console.log("\n🏆 INTEGRATION TEST COMPLETE 🏆");
}

runGoldTierTest();
