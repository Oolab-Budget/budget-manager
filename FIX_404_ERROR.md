# Fix 404 Error on Railway

If you're getting 404 errors from your Railway deployment, follow these steps:

## Step 1: Verify Files Are Ready

Make sure these files are in your project root:
- ✅ `ups-proxy-server.js` (updated with fetch fix)
- ✅ `package.json` (updated with Node 18+ requirement)

## Step 2: Redeploy on Railway

### Option A: If using GitHub (Recommended)

1. **Commit and push your changes:**
   ```bash
   git add ups-proxy-server.js package.json
   git commit -m "Fix fetch compatibility and update Node version"
   git push
   ```

2. **In Railway:**
   - Go to your project dashboard
   - Railway should auto-deploy when you push
   - Or click "Redeploy" if needed

### Option B: If deploying directly

1. **In Railway dashboard:**
   - Go to your service
   - Click "Settings"
   - Under "Source", make sure it's connected correctly
   - Click "Redeploy"

## Step 3: Check Railway Logs

1. **In Railway dashboard:**
   - Go to your service
   - Click "Logs" tab
   - Look for these messages:
     ```
     UPS Proxy Server running on port XXXX
     Listening on 0.0.0.0:XXXX
     All routes registered successfully
     ```

2. **If you see errors:**
   - Check for "Cannot find module" errors
   - Check for port binding errors
   - Check for fetch-related errors

## Step 4: Verify Start Command

In Railway:
1. Go to your service → Settings
2. Check "Deploy" section
3. Make sure "Start Command" is: `npm start` (or leave blank - it will use package.json)

## Step 5: Test the Deployment

After redeploying, test these endpoints:

1. **Health check:**
   ```
   GET https://wholesome-generosity-production.up.railway.app/health
   ```
   Should return: `{"status":"ok","service":"UPS Proxy Server"}`

2. **Root endpoint:**
   ```
   GET https://wholesome-generosity-production.up.railway.app/
   ```
   Should return a list of available endpoints

3. **Track endpoint (should return 400, not 404):**
   ```
   POST https://wholesome-generosity-production.up.railway.app/api/ups/track
   Content-Type: application/json
   Body: {}
   ```
   Should return 400 (missing required fields), NOT 404

## Common Issues

### Issue: Still getting 404
**Solution:** 
- Check Railway logs - is the server starting?
- Verify the URL is correct
- Make sure you're using the correct HTTP method (GET vs POST)

### Issue: "Cannot find module 'node-fetch'"
**Solution:**
- Railway might not have installed dependencies
- Check that `package.json` has `node-fetch` in dependencies
- Try redeploying

### Issue: Server not starting
**Solution:**
- Check Railway logs for startup errors
- Verify PORT environment variable is set (Railway sets this automatically)
- Make sure Node.js version is 18+ (check in Railway settings)

## Quick Test Script

Run this to test your deployment:

```bash
node test-railway.js
```

Or test manually:
```bash
curl https://wholesome-generosity-production.up.railway.app/health
```

## Still Having Issues?

1. Check Railway logs for specific error messages
2. Verify all files are in the root directory (not in a subfolder)
3. Make sure `package.json` has the correct "start" script
4. Try creating a fresh Railway deployment
