# Quick Railway Deployment Guide

## Step 1: Prepare Files

Make sure you have these files in your project:
- `ups-proxy-server.js`
- `package.json`

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push files to GitHub:**
   - Commit `ups-proxy-server.js` and `package.json` to your repository
   - Push to GitHub

2. **In Railway:**
   - Click the "+ Create" button (top right)
   - Select "GitHub Repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy

### Option B: Deploy from Local Files

1. **In Railway:**
   - Click the "+ Create" button
   - Select "Empty Project"
   - Click "Add Service" → "GitHub Repo" or "Empty Service"

2. **Upload files:**
   - Click on your service
   - Go to "Settings" tab
   - Under "Source", you can:
     - Connect to GitHub repo, OR
     - Use Railway CLI to deploy

3. **Using Railway CLI (if needed):**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

## Step 3: Get Your Deployment URL

1. After deployment, Railway will give you a URL like:
   - `https://your-app-name.railway.app`
   - Or `https://your-app-name-production.up.railway.app`

2. **Copy this URL** - you'll need it for your frontend settings

## Step 4: Configure Your Frontend

1. Open your Budget Manager app
2. Go to **Settings** → **UPS Tracking API**
3. Paste your Railway URL in the **"Proxy Server URL"** field
4. Enter your UPS credentials
5. Click **"Test UPS Tracking"** to verify

## Step 5: Verify It's Working

1. Check Railway logs:
   - Go to "Logs" tab in Railway
   - You should see: "UPS Proxy Server running on port XXXX"

2. Test the health endpoint:
   - Visit: `https://your-app.railway.app/health`
   - Should return: `{"status":"ok","service":"UPS Proxy Server"}`

## Troubleshooting

- **"No deploys"**: Make sure `package.json` and `ups-proxy-server.js` are in the root of your repo
- **Build fails**: Check that Node.js version is 14+ (Railway auto-detects)
- **CORS errors**: Make sure your frontend domain is in the CORS origins list in `ups-proxy-server.js`





