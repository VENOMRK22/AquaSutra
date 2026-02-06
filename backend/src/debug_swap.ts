
import { HydroEconomicEngine, FarmContext } from './services/HydroEconomicEngine';

const engine = new HydroEconomicEngine();

const context: FarmContext = {
    pincode: '412001', // Western Maharashtra (Sugarcane Zone)
    lat: 18.5,
    lon: 73.8,
    soilType: 'Black',
    totalLandArea: 2, // 2 Acres
    previousCropId: 'Soybean', // Just random
};

const userIntent = 'Sugarcane';

(async () => {
    console.log(`\n--- DEBUGGING SMART SWAP FOR: ${userIntent} ---`);
    const results = await engine.getRecommendations(context, userIntent);

    const topResult = results[0];
    console.log('Top Recommendation:', topResult.name);
    console.log('Is Smart Swap:', topResult.isSmartSwap);
    console.log('Impact Object:', JSON.stringify(topResult.impact, null, 2));

    if (!topResult.isSmartSwap) {
        console.log('\nWhy not Smart Swap?');
        // ... logic trace manually if needed ...
    }
})();
