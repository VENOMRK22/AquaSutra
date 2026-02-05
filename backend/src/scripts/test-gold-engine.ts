
import { HydroEconomicEngine } from '../services/HydroEconomicEngine';

async function runEngineTest() {
    console.log("🚜 STARTING HYDRO-ECONOMIC ENGINE TEST (GOLD-TIER) 🚜\n");

    const engine = new HydroEconomicEngine();

    // Context: Small farmer in Prayagraj (Water Stressed)
    // Intent: Wants to grow Sugarcane (High Water)
    const MOCK_CONTEXT = {
        pincode: '211002', // Prayagraj
        lat: 25.43,
        lon: 81.84,
        soilType: 'Sandy Loam',
        totalLandArea: 2.5, // Acres
        previousCropId: 'wheat_lokwan'
    };

    console.log(`📍 Context: Pin ${MOCK_CONTEXT.pincode} | Soil: ${MOCK_CONTEXT.soilType} | Area: ${MOCK_CONTEXT.totalLandArea} acres`);
    console.log(`🎯 Intent: Farmer wants to grow 'Sugarcane'\n`);

    try {
        const results = await engine.getRecommendations(MOCK_CONTEXT, 'Sugarcane');

        console.log(`\n📊 RESULTS GENERATED: ${results.length} Crops Analyzed`);
        console.log("----------------------------------------------------------------");

        // 1. Validate Top Recommendation (Should be a Smart Swap)
        const winner = results[0];
        console.log(`🏆 CHAMPION: ${winner.name}`);
        console.log(`   > Profit Index: ₹${winner.profitIndex}/mm`);
        console.log(`   > Risk Score: ${winner.riskAssessment.riskScore} (${winner.riskAssessment.riskLevel})`);
        console.log(`   > Is Smart Swap? ${winner.isSmartSwap ? 'YES' : 'NO'}`);
        console.log(`   > Reason: ${winner.reason.join(' | ')}`);

        // 2. Validate Gold-Tier Data Fields
        console.log("\n🔍 GOLD-TIER DATA CHECK:");
        console.log(`   > Market Price: ₹${winner.marketPrice}/ton (Trend: ${winner.priceTrend})`);
        console.log(`   > Adjusted Yield: ${winner.adjustedYield}t (Base: ${winner.debug.baseYield}t)`);
        console.log(`   > Water Cost: ₹${winner.waterCost.totalCostSeason.toLocaleString()} (₹${winner.waterCost.totalCostPerMm}/mm)`);
        console.log(`   > Maintenance: ₹${winner.waterCost.borewellMaintenance}`);

        // 3. Validate Impact Analysis (Comparison with Sugarcane)
        if (winner.impact && winner.impact.comparison) {
            console.log("\n💡 IMPACT ANALYSIS (vs Sugarcane):");
            console.log(`   > Water Saved: ${winner.impact.totalLiters.toLocaleString()} Liters`);
            console.log(`   > Drinking Water For: ${winner.impact.drinkingWaterDays} days`);
            console.log(`   > Profit Uplift: ₹${winner.impact.comparison.savingsBreakdown.yieldImprovement.toLocaleString()}`);
            console.log(`   > Risk Reduction: ${winner.impact.comparison.savingsBreakdown.riskReduction} points`);
        } else {
            console.log("\n⚠️ No impact comparison available (Winner might be the Intent crop)");
        }

    } catch (error) {
        console.error("❌ ENGINE TEST FAILED:", error);
    }
}

runEngineTest();
