
import axios from 'axios';

async function testComparison() {
    try {
        console.log("Testing Compare Crops API...");

        const payload = {
            cropIds: ['tomato_hybrid', 'sugarcane_1', 'cotton_bt'],
            farmContext: {
                pincode: '413709',
                lat: 19.1,
                lon: 74.5,
                soilType: 'Black'
            }
        };

        const res = await axios.post('http://localhost:3000/api/inference/compare-crops', payload);

        console.log("Response Status:", res.status);
        console.log("Comparison Results Count:", res.data.comparison.length);
        res.data.comparison.forEach((c: any) => {
            console.log(`- ${c.name} (Profit: ${c.totalProfit}, Risk: ${c.riskScore})`);
        });

    } catch (e: any) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}

testComparison();
