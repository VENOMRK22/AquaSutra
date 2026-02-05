
import { calculateWaterBalance } from '../services/waterScore';

async function runTest() {
    console.log("--- STARTING WATER BALANCE TEST ---");

    // 1. Test Prayagraj (Critical Zone)
    // Lat/Lon for Chaka, Prayagraj
    const prayagrajLat = 25.4358;
    const prayagrajLon = 81.8463;
    console.log(`\nTesting Prayagraj (Lat: ${prayagrajLat}, Lon: ${prayagrajLon})...`);
    try {
        const resultPrayagraj = await calculateWaterBalance(prayagrajLat, prayagrajLon);
        console.log("Prayagraj Result:", resultPrayagraj);
        // We expect lower balance due to deeper aquifer (logic inverse? Actually deeper aquifer usually holds more, 
        // BUT assuming 'active' depth vs 'water table depth'. 
        // Logic in waterScore is: Storage = Aquifer Depth * Specific Yield.
        // Wait, if Aquifer Depth is 'Depth to Water Table', then deeper = LESS water?
        // Let's check waterScore.ts logic again.
        // const aquiferDepth_mm = aquiferDepth_m * 1000;
        // const currentStorage_mm = aquiferDepth_mm * SPECIFIC_YIELD * soilMoistureIndex;

        // Actually currently `aquiferDepth_m` is treated as "Thickness of Aquifer".
        // If getting "Groundwater Level" (bgl), that is depth FROM surface.
        // We probably need (Total Depth - BGL) to get "Saturated Thickness".
        // But for this test, we just want to see the INPUT changed.
    } catch (e) { console.error(e); }

    // 2. Test Pune (Safe Zone - Default)
    const puneLat = 18.5204;
    const puneLon = 73.8567;
    console.log(`\nTesting Pune (Lat: ${puneLat}, Lon: ${puneLon})...`);
    try {
        const resultPune = await calculateWaterBalance(puneLat, puneLon);
        console.log("Pune Result:", resultPune);
    } catch (e) { console.error(e); }

    console.log("\n--- TEST COMPLETE ---");
}

runTest();
