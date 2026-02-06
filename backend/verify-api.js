const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function testApi() {
    console.log("Testing API...");
    try {
        const data = JSON.stringify({
            cropIds: ["sugarcane_1", "gram_chana"],
            farmContext: { pincode: "413709", lat: 19.1, lon: 74.5, soilType: "Black", totalLandArea: 5 }
        });

        const result = await postRequest('/api/inference/compare-crops', data);
        console.log(`Status: ${result.status}`);
        console.log(`Response: ${result.body.substring(0, 200)}...`);
    } catch (error) {
        console.error("Test Failed:", error.message);
    }
}

testApi();
