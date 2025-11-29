// UPS API Proxy Server
// This server handles UPS API requests to bypass CORS restrictions
// Deploy this to a service like Railway, Render, Heroku, or Vercel
// Updated with enhanced logging for debugging

const express = require('express');
const cors = require('cors');

// Use native fetch if available (Node 18+), otherwise use node-fetch
let fetch;
try {
    // Try to use native fetch (Node 18+)
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
        console.log('Using native fetch API');
    } else {
        throw new Error('No native fetch');
    }
} catch (e) {
    // Fallback to node-fetch for older Node versions
    fetch = require('node-fetch');
    console.log('Using node-fetch');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware - MUST be first to catch all requests
app.use((req, res, next) => {
    console.log(`\n=== INCOMING REQUEST ===`);
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log(`Request URL: ${req.url}`);
    console.log(`Request originalUrl: ${req.originalUrl}`);
    console.log(`Request headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`=== END REQUEST LOG ===\n`);
    next();
});

// Enable CORS for your frontend domain
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or file:// protocol)
        // This happens when opening HTML files directly (file://)
        if (!origin) {
            return callback(null, true);
        }
        
        const allowedOrigins = [
            'https://oolab-budget.github.io',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'null' // For file:// protocol
        ];
        
        // Allow all origins for now (you can restrict this later for security)
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-merchant-id', 'transId', 'transactionSrc']
}));

app.use(express.json());

// Root endpoint - list available endpoints
app.get('/', (req, res) => {
    res.json({
        service: 'UPS Proxy Server',
        status: 'running',
        endpoints: {
            health: 'GET /health',
            token: 'POST /api/ups/token',
            track: 'POST /api/ups/track',
            'track-alert-subscribe': 'POST /api/ups/track-alert/subscribe',
            'track-alert-webhook': 'POST /api/ups/track-alert/webhook',
            test: 'POST /api/ups/test'
        }
    });
});

// UPS OAuth Token Endpoint
app.post('/api/ups/token', async (req, res) => {
    try {
        const { clientId, clientSecret, environment } = req.body;
        
        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: 'Client ID and Client Secret are required' });
        }
        
        // Support test or production environment
        const isTest = environment === 'test' || process.env.UPS_ENV === 'test';
        const baseUrl = isTest ? 'https://wwwcie.ups.com' : 'https://onlinetools.ups.com';
        
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        const response = await fetch(`${baseUrl}/security/v1/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
                'x-merchant-id': clientId
            },
            body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('UPS OAuth error:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPS Tracking Endpoint - Enhanced logging for debugging 404 errors
app.post('/api/ups/track', async (req, res) => {
    console.log('=== POST /api/ups/track - Request received ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request originalUrl:', req.originalUrl);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    try {
        console.log('Step 1: Extracting request body...');
        const { trackingNumber, accessToken, clientId, environment } = req.body;
        console.log('Step 2: Extracted - trackingNumber:', trackingNumber, 'accessToken exists:', !!accessToken, 'clientId:', clientId, 'environment:', environment);
        
        if (!trackingNumber || !accessToken) {
            console.log('Step 3: Missing required fields - returning 400');
            return res.status(400).json({ error: 'Tracking number and access token are required' });
        }
        
        console.log('Step 4: Building request to UPS API...');
        const transId = 'tracking-' + Date.now();
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'transId': transId,
            'transactionSrc': 'budget-manager'
        };
        
        // Note: x-merchant-id may not be required for Tracking API v1
        // Only include if explicitly needed (some APIs require it, others don't)
        // Commenting out to test if it's causing the 401 error
        // if (clientId) {
        //     headers['x-merchant-id'] = clientId;
        // }
        
        // Determine if using test or production environment (default to production)
        const isTest = (environment === 'test' || process.env.UPS_ENV === 'test');
        const baseUrl = isTest ? 'https://wwwcie.ups.com' : 'https://onlinetools.ups.com';
        console.log('Step 4a: Using environment:', isTest ? 'TEST' : 'PRODUCTION', 'Base URL:', baseUrl);
        
        // UPS API endpoint: /track/v1/details/{trackingNumber} (not /api/track/v1/details)
        // Use GET method as per UPS API documentation
        const upsTrackUrl = `${baseUrl}/track/v1/details/${trackingNumber}`;
        console.log('Step 5: Calling UPS API...', 'URL:', upsTrackUrl);
        console.log('Step 5a: Using GET method with tracking number in URL path');
        const response = await fetch(upsTrackUrl, {
            method: 'GET',
            headers: headers
        });
        
        console.log('Step 6: UPS API response received - Status:', response.status, 'OK:', response.ok);
        console.log('Step 6a: Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
        
        if (!response.ok) {
            // Try to read error response - could be text, JSON, or empty
            let errorText = '';
            let errorJson = null;
            const contentType = response.headers.get('content-type') || '';
            
            // Extract error information from headers (UPS sometimes puts error info in headers)
            const errorCode = response.headers.get('errorcode') || '';
            const errorDescription = response.headers.get('errordescription') || '';
            
            // Always try to read as text first (works for any content type)
            try {
                errorText = await response.text();
                
                // If we got text and it looks like JSON, try to parse it
                if (errorText && errorText.trim().startsWith('{')) {
                    try {
                        errorJson = JSON.parse(errorText);
                    } catch (parseError) {
                        // Not valid JSON, keep as text
                        console.log('Step 7: Response text is not valid JSON, keeping as text');
                    }
                }
            } catch (readError) {
                console.log('Step 7: Failed to read error response:', readError);
                errorText = `Failed to read error response: ${readError.message}`;
            }
            
            // Build error message from available sources
            let errorMessage = '';
            if (errorText && errorText.trim() !== '') {
                errorMessage = errorText;
            } else if (errorCode || errorDescription) {
                errorMessage = `UPS API Error: ${errorCode} - ${errorDescription}`.trim();
            } else {
                errorMessage = `UPS API returned ${response.status} with empty response body`;
            }
            
            console.log('Step 7: UPS API error - Status:', response.status);
            console.log('Step 7a: Content-Type:', contentType);
            console.log('Step 7b: Error Code (header):', errorCode);
            console.log('Step 7c: Error Description (header):', errorDescription);
            console.log('Step 7d: Error text (first 500 chars):', errorText ? errorText.substring(0, 500) : '(empty)');
            console.log('Step 7e: Error text length:', errorText ? errorText.length : 0);
            console.log('Step 7f: Error JSON:', errorJson);
            console.log('Step 7g: Headers sent to UPS:', JSON.stringify(headers, null, 2));
            console.log('Step 7h: UPS API URL:', upsTrackUrl);
            
            // Return 502 (Bad Gateway) instead of forwarding UPS API status codes
            // This makes it clear the proxy is working but UPS API failed
            return res.status(502).json({ 
                error: 'UPS API returned an error',
                upsStatus: response.status,
                upsErrorCode: errorCode,
                upsErrorDescription: errorDescription,
                upsError: errorMessage,
                upsErrorJson: errorJson,
                message: `UPS API returned status ${response.status}. ${errorMessage}`,
                debug: {
                    contentType: contentType,
                    trackingNumber: trackingNumber,
                    hasAccessToken: !!accessToken,
                    hasClientId: !!clientId,
                    errorTextLength: errorText ? errorText.length : 0,
                    allResponseHeaders: Object.fromEntries(response.headers.entries())
                }
            });
        }
        
        console.log('Step 8: Parsing UPS API response...');
        const data = await response.json();
        console.log('Step 9: Sending response to client...');
        res.json(data);
        console.log('Step 10: Response sent successfully');
    } catch (error) {
        console.error('UPS Tracking error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// UPS Track Alert - Subscribe to tracking numbers
app.post('/api/ups/track-alert/subscribe', async (req, res) => {
    console.log('=== POST /api/ups/track-alert/subscribe - Request received ===');
    try {
        const { trackingNumbers, webhookUrl, accessToken, clientId, environment } = req.body;
        
        if (!trackingNumbers || !Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
            return res.status(400).json({ error: 'trackingNumbers array is required' });
        }
        
        if (trackingNumbers.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 tracking numbers per request' });
        }
        
        if (!webhookUrl) {
            return res.status(400).json({ error: 'webhookUrl is required' });
        }
        
        if (!accessToken) {
            return res.status(400).json({ error: 'accessToken is required' });
        }
        
        // Determine environment
        const isTest = environment === 'test' || process.env.UPS_ENV === 'test';
        const baseUrl = isTest ? 'https://wwwcie.ups.com' : 'https://onlinetools.ups.com';
        
        const transId = 'track-alert-' + Date.now();
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'transId': transId,
            'transactionSrc': 'budget-manager'
        };
        
        if (clientId) {
            headers['x-merchant-id'] = clientId;
        }
        
        // Track Alert subscription request
        const subscriptionRequest = {
            locale: 'en_US',
            countryCode: 'US',
            trackingNumberList: trackingNumbers,
            destination: {
                url: webhookUrl,
                credentialType: 'Bearer',
                credential: accessToken // UPS will send this back in webhook headers
            }
        };
        
        console.log('Subscribing tracking numbers:', trackingNumbers);
        console.log('Webhook URL:', webhookUrl);
        
        const response = await fetch(`${baseUrl}/api/track/v1/subscription/standard/package`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(subscriptionRequest)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorJson = null;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                // Not JSON
            }
            
            console.error('Track Alert subscription failed:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Track Alert subscription failed',
                upsStatus: response.status,
                upsError: errorText,
                upsErrorJson: errorJson
            });
        }
        
        const data = await response.json();
        console.log('Track Alert subscription successful:', data);
        res.json(data);
        
    } catch (error) {
        console.error('Track Alert subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPS Track Alert - Webhook endpoint (receives push notifications from UPS)
app.post('/api/ups/track-alert/webhook', async (req, res) => {
    console.log('=== POST /api/ups/track-alert/webhook - Webhook received ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        // UPS requires a quick 200 response (within milliseconds)
        // Process the event asynchronously after responding
        res.status(200).json({ received: true });
        
        // Process the webhook event asynchronously
        setImmediate(() => {
            processTrackAlertWebhook(req.body, req.headers);
        });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Still return 200 to UPS even if processing fails
        res.status(200).json({ received: true, error: error.message });
    }
});

// Process Track Alert webhook event
function processTrackAlertWebhook(eventData, headers) {
    try {
        console.log('Processing Track Alert webhook event...');
        
        const {
            trackingNumber,
            activityStatus,
            activityLocation,
            localActivityDate,
            localActivityTime,
            scheduledDeliveryDate,
            actualDeliveryDate,
            actualDeliveryTime,
            gmtActivityDate,
            gmtActivityTime
        } = eventData;
        
        const status = activityStatus || {};
        const statusType = status.type || '';
        const statusCode = status.code || '';
        const statusDescription = status.description || '';
        
        console.log('Event details:', {
            trackingNumber,
            statusType,
            statusCode,
            statusDescription,
            localActivityDate,
            localActivityTime,
            actualDeliveryDate,
            actualDeliveryTime
        });
        
        // Determine status based on status type
        // M/MV = manifest, X = exception, I = in-progress, U = update, D = delivery
        let deliveryStatus = 'In Transit';
        if (statusType === 'D') {
            deliveryStatus = actualDeliveryDate ? 'Delivered' : 'Out for Delivery';
        } else if (statusType === 'X') {
            deliveryStatus = 'Exception';
        } else if (statusType === 'I') {
            deliveryStatus = 'In Transit';
        } else if (statusType === 'M' || statusType === 'MV') {
            deliveryStatus = 'Manifest';
        } else if (statusType === 'U') {
            deliveryStatus = 'Update';
        }
        
        // Store event for frontend to retrieve
        // In a real implementation, you'd store this in a database
        // For now, we'll log it and the frontend can poll or use a different mechanism
        console.log('Track Alert Event:', {
            trackingNumber,
            status: deliveryStatus,
            statusDescription,
            statusCode,
            statusType,
            location: activityLocation,
            deliveryDate: actualDeliveryDate,
            deliveryTime: actualDeliveryTime,
            scheduledDate: scheduledDeliveryDate,
            timestamp: new Date().toISOString()
        });
        
        // TODO: Store in database or send to frontend via WebSocket/SSE
        // For now, frontend will need to check for updates
        
    } catch (error) {
        console.error('Error processing webhook event:', error);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'UPS Proxy Server' });
});

// Test endpoint to verify routing works
app.post('/api/ups/test', (req, res) => {
    res.json({ 
        message: 'Test endpoint works!',
        timestamp: new Date().toISOString(),
        body: req.body
    });
});

// Catch-all route for debugging
app.use((req, res) => {
    console.log(`=== 404 ERROR ===`);
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(`URL: ${req.url}`);
    console.log(`Original URL: ${req.originalUrl}`);
    console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
    res.status(404).json({
        error: 'Endpoint not found',
        method: req.method,
        path: req.path,
        url: req.url,
        originalUrl: req.originalUrl,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/ups/token',
            'POST /api/ups/track',
            'POST /api/ups/track-alert/subscribe',
            'POST /api/ups/track-alert/webhook',
            'POST /api/ups/test'
        ]
    });
});

// Verify routes are registered
console.log('Registering routes...');
    console.log('  - GET /');
    console.log('  - GET /health');
    console.log('  - POST /api/ups/token');
    console.log('  - POST /api/ups/track');
    console.log('  - POST /api/ups/track-alert/subscribe');
    console.log('  - POST /api/ups/track-alert/webhook');
    console.log('  - POST /api/ups/test');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPS Proxy Server running on port ${PORT}`);
    console.log(`Listening on 0.0.0.0:${PORT}`);
    console.log('Endpoints available: /health, /api/ups/token, /api/ups/track, /api/ups/track-alert/subscribe, /api/ups/track-alert/webhook');
    console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: PORT
    });
    console.log('Server started at:', new Date().toISOString());
    console.log('Enhanced logging enabled for /api/ups/track endpoint');
    console.log('All routes registered successfully');
});

