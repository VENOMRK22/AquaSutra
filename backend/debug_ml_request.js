
const http = require('http');

const data = JSON.stringify({
    pincode: "411001",
    lat: 18.5204,
    lon: 73.8567,
    soilType: "Clay",
    totalLandArea: 5
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/inference/crop-recommendation',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';

    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        try {
            console.log('Response Body:', responseBody);
            const parsed = JSON.parse(responseBody);
            console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error('Failed to parse JSON:', e);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
