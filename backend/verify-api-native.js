
const http = require('http');

const data = JSON.stringify({
    cropIds: ['sugarcane_1', 'gram_chana'],
    farmContext: { pincode: '413709', lat: 19.1, lon: 74.5, soilType: 'Black' }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/inference/compare-crops',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request...");
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response Body:', body.substring(0, 200) + '...');
        if (body.includes("comparison")) {
            console.log("✅ API Verified Success");
        } else {
            console.log("❌ API Response Invalid");
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
