
import { calculateWaterBalance } from '../services/waterScore';

const testCases = [
    { name: '1. Prayagraj (Chaka) - CRITICAL', lat: 25.4358, lon: 81.8463, desc: 'Known Critical Block, Deep Aquifer' },
    { name: '2. Prayagraj (Sahson) - OVER-EXPLOITED', lat: 25.5500, lon: 81.9500, desc: 'Govt Over-exploited status, should trigger override' },
    { name: '3. Pune - SAFE', lat: 18.5204, lon: 73.8567, desc: 'Standard Safe Zone, High Rainfall' },
    { name: '4. Nagpur - MODERATE', lat: 21.1458, lon: 79.0882, desc: 'Central India (Vidarbha), Average conditions' },
    { name: '5. Jaisalmer - DESERT', lat: 26.9157, lon: 70.9083, desc: 'Arid zone, low rainfall, should be Deficit' }
];

async function runTest() {
    console.log("--- STARTING COMPREHENSIVE WATER BALANCE TEST ---\n");

    for (const test of testCases) {
        console.log(`\n🔹 TESTING: ${test.name}`);
        console.log(`   Context: ${test.desc}`);
        try {
            const result = await calculateWaterBalance(test.lat, test.lon);
            console.log(`   > Location Resolved: ${result.villageName}`);
            console.log(`   > Status: ${result.status.toUpperCase()}`);
            console.log(`   > Message: ${result.message}`);
            console.log(`   > Net Balance: ${result.balance_mm} mm`);
            console.log(`   > Days Left: ${Math.round(result.balance_mm / 4)} days`);

            if ((result as any).actualWaterTableDepth) {
                console.log(`   > Aquifer Depth: ${(result as any).actualWaterTableDepth}m`);
            }
            if ((result as any).cgwbClassification) {
                console.log(`   > CGWB Class: ${(result as any).cgwbClassification}`);
            }
            if ((result as any).graceAnomaly_cm !== undefined) {
                console.log(`   > NASA GRACE Anomaly: ${(result as any).graceAnomaly_cm} cm`);
            }
            if ((result as any).satelliteTrend_cm_yr !== undefined) {
                console.log(`   > Sat Trend: ${(result as any).satelliteTrend_cm_yr} cm/yr`);
            }

        } catch (error) {
            console.error(`   ❌ Failed:`, error);
        }
        console.log("-----------------------------------------");
    }
}

runTest();
