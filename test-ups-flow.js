// Test the full UPS tracking flow through the proxy
const https = require('https');

const PROXY_URL = 'https://wholesome-generosity-production.up.railway.app';

// You'll need to add your actual credentials here
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const TEST_TRACKING_NUMBER = '1Z12345E0291980793'; // Replace with a real tracking number

function makeRequest(path, method = 'GET', body = null) {
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
                    resolve({ status: res.statusCode, data: json, raw: data });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data, raw: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testFullFlow() {
    console.log('Testing UPS Tracking Flow Through Proxy\n');
    console.log('='.repeat(60));
    
    if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
        console.log('⚠️  Please update CLIENT_ID and CLIENT_SECRET in this script first!');
        return;
    }
    
    try {
        // Step 1: Get OAuth Token
        console.log('\n1. Getting OAuth Token...');
        const tokenResponse = await makeRequest('/api/ups/token', 'POST', {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        });
        
        console.log(`   Status: ${tokenResponse.status}`);
        if (tokenResponse.status === 200) {
            const accessToken = tokenResponse.data.access_token;
            console.log(`   ✓ Token received: ${accessToken ? accessToken.substring(0, 20) + '...' : 'MISSING'}`);
            
            if (!accessToken) {
                console.log('   ❌ ERROR: No access_token in response!');
                console.log('   Response:', JSON.stringify(tokenResponse.data, null, 2));
                return;
            }
            
            // Step 2: Track Package
            console.log('\n2. Tracking Package...');
            console.log(`   Tracking Number: ${TEST_TRACKING_NUMBER}`);
            const trackResponse = await makeRequest('/api/ups/track', 'POST', {
                trackingNumber: TEST_TRACKING_NUMBER,
                accessToken: accessToken,
                clientId: CLIENT_ID
            });
            
            console.log(`   Status: ${trackResponse.status}`);
            if (trackResponse.status === 200) {
                console.log('   ✓ Tracking data received!');
                if (trackResponse.data.trackResponse) {
                    console.log('   ✓ Response has trackResponse structure');
                    const shipment = trackResponse.data.trackResponse.shipment?.[0];
                    if (shipment) {
                        const pkg = shipment.package?.[0];
                        if (pkg) {
                            const status = pkg.currentStatus?.description || 'Unknown';
                            console.log(`   Package Status: ${status}`);
                        }
                    }
                } else {
                    console.log('   ⚠️  Response structure may be different');
                    console.log('   Response keys:', Object.keys(trackResponse.data));
                }
            } else {
                console.log('   ❌ ERROR: Tracking failed');
                console.log('   Response:', JSON.stringify(trackResponse.data, null, 2));
            }
        } else {
            console.log('   ❌ ERROR: Token request failed');
            console.log('   Response:', JSON.stringify(tokenResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
}

testFullFlow();
