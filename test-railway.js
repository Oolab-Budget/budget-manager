// Quick test to check Railway deployment
const https = require('https');

const PROXY_URL = 'https://wholesome-generosity-production.up.railway.app';

async function testEndpoint(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, PROXY_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testRailway() {
    console.log('Testing Railway Deployment:', PROXY_URL);
    console.log('='.repeat(60));
    
    try {
        // Test 1: Root endpoint
        console.log('\n1. Testing GET /');
        const root = await testEndpoint('/');
        console.log(`   Status: ${root.status}`);
        console.log(`   Response:`, JSON.stringify(root.data, null, 2));
        
        // Test 2: Health endpoint
        console.log('\n2. Testing GET /health');
        const health = await testEndpoint('/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response:`, JSON.stringify(health.data, null, 2));
        
        // Test 3: Track endpoint (should return 400, not 404)
        console.log('\n3. Testing POST /api/ups/track (empty body)');
        const track = await testEndpoint('/api/ups/track', 'POST', {});
        console.log(`   Status: ${track.status}`);
        console.log(`   Response:`, JSON.stringify(track.data, null, 2));
        
        if (track.status === 404) {
            console.log('\n❌ PROBLEM: /api/ups/track returns 404!');
            console.log('   This means the endpoint is not found.');
            console.log('   Possible causes:');
            console.log('   - Server not deployed correctly on Railway');
            console.log('   - Routes not registered properly');
            console.log('   - Railway not running the server');
        } else if (track.status === 400) {
            console.log('\n✅ GOOD: Endpoint exists (400 is expected for missing required fields)');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
}

testRailway();


