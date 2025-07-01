// Simple test to verify API endpoints
const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`\n=== ${path} ===`);
                console.log(`Status: ${res.statusCode}`);
                console.log(`Data length: ${data.length}`);
                if (path === '/api/stats') {
                    console.log(`Response: ${data}`);
                } else {
                    try {
                        const json = JSON.parse(data);
                        console.log(`Records: ${json.length}`);
                        if (json.length > 0) {
                            console.log(`First record keys: ${Object.keys(json[0]).join(', ')}`);
                        }
                    } catch (e) {
                        console.log(`Response: ${data.substring(0, 200)}...`);
                    }
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`Error testing ${path}:`, err.message);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    console.log('Testing API endpoints...');
    await testEndpoint('/api/health');
    await testEndpoint('/api/stats');
    await testEndpoint('/api/flashcards');
    await testEndpoint('/api/quiz');
    console.log('\nDone!');
    process.exit(0);
}

setTimeout(runTests, 2000); // Wait 2 seconds for server to be ready