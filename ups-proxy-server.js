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
    origin: [
        'https://oolab-budget.github.io',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'file://' // Allow local file access
    ],
    credentials: true
}));

app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`UPS Proxy Server running on port ${PORT}`);
});

