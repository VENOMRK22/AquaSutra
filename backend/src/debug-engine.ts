
import { HydroEconomicEngine, FarmContext } from './services/HydroEconomicEngine';

const engine = new HydroEconomicEngine();

const testCases = [
    {
        name: "Western Mah (Pune 411001) - Clay Soil",
        ctx: {
            pincode: '411001',
            lat: 18.52,
            lon: 73.85,
            soilType: 'Clay',
            totalLandArea: 5,
            previousCropId: 'sugarcane_1'
        }
    },
    {
        name: "Vidarbha (Nagpur 440001) - Black Soil",
        ctx: {
            pincode: '440001',
            lat: 21.14,
            lon: 79.08,
            soilType: 'Black',
            totalLandArea: 5,
            previousCropId: 'cotton_bt'
        }
    },
    {
        name: "Unknown Region (111111) - Medium Soil",
        ctx: {
            pincode: '111111',
            lat: 20.0,
            lon: 76.0,
            soilType: 'Medium',
            totalLandArea: 5
        }
    }
];

testCases.forEach(test => {
    console.log(`\n--- TEST: ${test.name} ---`);
    const results = engine.getRecommendations(test.ctx as FarmContext);
    results.forEach((r, i) => {
        console.log(`#${i + 1} ${r.name}`);
        console.log(`   PI: ${r.profitIndex}, Score: ${r.viabilityScore}`);
        console.log(`   Debug: bucket=${r.debug.bucketSize}, rev=${r.debug.projectedRevenue}, cost=${r.debug.waterCost}`);
    });
});
