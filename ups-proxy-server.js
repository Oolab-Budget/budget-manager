// UPS API Proxy Server
// This server handles UPS API requests to bypass CORS restrictions
// Deploy this to a service like Railway, Render, Heroku, or Vercel

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

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
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Root endpoint - list available endpoints
app.get('/', (req, res) => {
    res.json({
        service: 'UPS Proxy Server',
        status: 'running',
        endpoints: {
            health: 'GET /health',
            token: 'POST /api/ups/token',
            track: 'POST /api/ups/track'
        }
    });
});

// UPS OAuth Token Endpoint
app.post('/api/ups/token', async (req, res) => {
    try {
        const { clientId, clientSecret } = req.body;
        
        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: 'Client ID and Client Secret are required' });
        }
        
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        const response = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
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

// UPS Tracking Endpoint
app.post('/api/ups/track', async (req, res) => {
    console.log('POST /api/ups/track - Request received');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    try {
        const { trackingNumber, accessToken, clientId } = req.body;
        
        if (!trackingNumber || !accessToken) {
            return res.status(400).json({ error: 'Tracking number and access token are required' });
        }
        
        const transId = 'tracking-' + Date.now();
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'transId': transId,
            'transactionSrc': 'budget-manager'
        };
        
        if (clientId) {
            headers['x-merchant-id'] = clientId;
        }
        
        const requestBody = {
            TrackRequest: {
                Request: {
                    RequestOption: '1',
                    TransactionReference: {
                        CustomerContext: transId
                    }
                },
                InquiryNumber: trackingNumber
            }
        };
        
        const response = await fetch('https://onlinetools.ups.com/api/track/v1/details', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('UPS Tracking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'UPS Proxy Server' });
});

// Catch-all route for debugging
app.use((req, res) => {
    console.log(`404 - ${req.method} ${req.path} - Not found`);
    res.status(404).json({
        error: 'Endpoint not found',
        method: req.method,
        path: req.path,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/ups/token',
            'POST /api/ups/track'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`UPS Proxy Server running on port ${PORT}`);
    console.log('Endpoints available: /health, /api/ups/token, /api/ups/track');
});

