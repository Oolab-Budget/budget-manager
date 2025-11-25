# UPS Proxy Server Deployment Guide

This guide will help you deploy the UPS API proxy server to handle CORS restrictions.

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway.app](https://railway.app)** (free tier available)
2. **Create a new project**
3. **Connect your GitHub repository** or upload the files:
   - `ups-proxy-server.js`
   - `package.json`
4. **Railway will automatically detect Node.js** and deploy
5. **Copy your deployment URL** (e.g., `https://your-app.railway.app`)

### Option 2: Render

1. **Sign up at [Render.com](https://render.com)** (free tier available)
2. **Create a new Web Service**
3. **Connect your repository** or upload files
4. **Set build command:** `npm install`
5. **Set start command:** `npm start`
6. **Copy your deployment URL**

### Option 3: Heroku

1. **Install Heroku CLI** from [heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-app-name`
4. **Deploy:** `git push heroku main`
5. **Copy your deployment URL**

### Option 4: Vercel (Serverless Functions)

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Create a new project**
3. **Create `api/ups/token.js` and `api/ups/track.js`** (see Vercel section below)

## Update Your Frontend Code

After deploying, update your `index.html` to use the proxy server:

### Update `getUPSToken()` function:

```javascript
async function getUPSToken() {
    const clientId = localStorage.getItem('upsClientId');
    const clientSecret = localStorage.getItem('upsClientSecret');
    
    if (!clientId || !clientSecret) {
        throw new Error('UPS credentials not configured');
    }
    
    // Replace with your deployed proxy server URL
    const PROXY_URL = 'https://your-app.railway.app'; // or your Render/Heroku URL
    
    try {
        const response = await fetch(`${PROXY_URL}/api/ups/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clientId, clientSecret })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get UPS token');
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('UPS OAuth error:', error);
        throw error;
    }
}
```

### Update `checkUPSTracking()` function:

```javascript
async function checkUPSTracking(trackingNumber) {
    try {
        const token = await getUPSToken();
        const clientId = localStorage.getItem('upsClientId');
        
        // Replace with your deployed proxy server URL
        const PROXY_URL = 'https://your-app.railway.app'; // or your Render/Heroku URL
        
        const response = await fetch(`${PROXY_URL}/api/ups/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                trackingNumber,
                accessToken: token,
                clientId
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to track package');
        }
        
        const data = await response.json();
        // ... rest of your tracking logic
        return data;
    } catch (error) {
        console.error('UPS Tracking error:', error);
        throw error;
    }
}
```

## Environment Variables (Optional)

If you want to add security, you can set environment variables on your hosting platform:

- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `API_KEY`: Optional API key for additional security

## Testing Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   ```

3. **Test the endpoints:**
   - Health check: `http://localhost:3000/health`
   - Token: `POST http://localhost:3000/api/ups/token`
   - Track: `POST http://localhost:3000/api/ups/track`

## Security Notes

- The proxy server handles CORS for your frontend
- Client ID and Secret are sent from frontend to proxy (consider adding API key authentication)
- For production, consider adding rate limiting and request validation

## Troubleshooting

- **CORS errors:** Make sure your frontend domain is in the `cors` origin list
- **502 errors:** Check that your server is running and dependencies are installed
- **401 errors:** Verify your UPS credentials are correct

