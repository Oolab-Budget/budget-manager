// Quick test for Railway deployment
const https = require('https');

const url = 'https://wholesome-generosity-production.up.railway.app';

function test(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'wholesome-generosity-production.up.railway.app',
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ status: res.statusCode, data: data });
            });
        });

        req.on('error', reject);
        if (method === 'POST') {
            req.write('{}');
        }
        req.end();
    });
}

async function runTests() {
    console.log('Testing Railway Deployment...\n');
    
    try {
        // Test 1: Health endpoint
        console.log('1. Testing /health...');
        const health = await test('/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response: ${health.data}\n`);
        
        // Test 2: Root endpoint
        console.log('2. Testing /...');
        const root = await test('/');
        console.log(`   Status: ${root.status}`);
        console.log(`   Response: ${root.data.substring(0, 200)}...\n`);
        
        // Test 3: Track endpoint (should be 400, not 404)
        console.log('3. Testing /api/ups/track (POST with empty body)...');
        const track = await test('/api/ups/track', 'POST');
        console.log(`   Status: ${track.status}`);
        console.log(`   Response: ${track.data.substring(0, 300)}...\n`);
        
        if (track.status === 404) {
            console.log('❌ PROBLEM: Still getting 404 on /api/ups/track');
        } else if (track.status === 400) {
            console.log('✅ SUCCESS: Endpoint exists! (400 is expected for missing fields)');
        } else {
            console.log(`✅ Endpoint responded with status ${track.status}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

runTests();
