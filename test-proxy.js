// Quick test script to verify UPS proxy endpoints
// Run with: node test-proxy.js

const fetch = require('node-fetch');

const PROXY_URL = 'https://wholesome-generosity-production.up.railway.app';

async function testProxy() {
    console.log('Testing UPS Proxy Server:', PROXY_URL);
    console.log('---\n');
    
    // Test 1: Health check
    console.log('1. Testing GET /health...');
    try {
        const healthRes = await fetch(`${PROXY_URL}/health`);
        const healthData = await healthRes.json();
        console.log('   ✓ Health check:', healthData);
    } catch (error) {
        console.log('   ✗ Health check failed:', error.message);
    }
    
    // Test 2: Root endpoint
    console.log('\n2. Testing GET /...');
    try {
        const rootRes = await fetch(`${PROXY_URL}/`);
        const rootData = await rootRes.json();
        console.log('   ✓ Root endpoint:', rootData);
    } catch (error) {
        console.log('   ✗ Root endpoint failed:', error.message);
    }
    
    // Test 3: Check if /api/ups/track endpoint exists (should return 400, not 404)
    console.log('\n3. Testing POST /api/ups/track (without body - should return 400, not 404)...');
    try {
        const trackRes = await fetch(`${PROXY_URL}/api/ups/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const trackData = await trackRes.json();
        console.log(`   Status: ${trackRes.status}`);
        console.log(`   Response:`, trackData);
        if (trackRes.status === 404) {
            console.log('   ✗ ERROR: Endpoint returns 404 - it may not be deployed correctly!');
        } else if (trackRes.status === 400) {
            console.log('   ✓ Endpoint exists (400 is expected for missing required fields)');
        }
    } catch (error) {
        console.log('   ✗ Request failed:', error.message);
    }
    
    console.log('\n---\nTest complete!');
}

testProxy();
