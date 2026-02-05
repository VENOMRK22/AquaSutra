
const fetch = require('node-fetch'); // or use built-in fetch if node 18+

async function testApi() {
    try {
        console.log("Testing API...");
        const response = await fetch('http://localhost:3000/api/inference/compare-crops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cropIds: ['sugarcane_1', 'gram_chana'],
                farmContext: { pincode: '413709', lat: 19.1, lon: 74.5 }
            })
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
        } else {
            const data = await response.json();
            console.log("API Success!");
            console.log("Comparison Data Length:", data.comparison?.length);
            if (data.comparison?.length > 0) {
                console.log("Sample Crop:", data.comparison[0].name);
            }
        }
    } catch (error) {
        console.error("Connection Failed:", error.message);
    }
}

testApi();
