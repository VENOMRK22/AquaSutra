
const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/inference/compare-crops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cropIds: ["sugarcane_1", "cotton_bt"],
                farmContext: {
                    pincode: "413709",
                    lat: 19.1,
                    lon: 74.5,
                    soilType: "Black"
                }
            })
        });

        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
