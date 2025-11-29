# Railway Deployment Instructions - Option 1: Deploy from GitHub

## Step 1: Add Proxy Server Files to Your GitHub Repository

### 1.1 Navigate to Your Repository Folder
1. Open File Explorer
2. Go to: `C:\Users\Mike\Desktop\Budget manager`
3. Make sure these files exist in this folder:
   - `ups-proxy-server.js`
   - `package.json`

### 1.2 Commit and Push to GitHub

**If you're using GitHub Desktop:**
1. Open GitHub Desktop
2. Make sure your "Budget manager" repository is selected
3. You should see the new files (`ups-proxy-server.js` and `package.json`) in the "Changes" tab
4. Write a commit message like: "Add UPS proxy server"
5. Click "Commit to main" (or your branch name)
6. Click "Push origin" to upload to GitHub

**If you're using Git command line:**
```bash
cd "C:\Users\Mike\Desktop\Budget manager"
git add ups-proxy-server.js package.json
git commit -m "Add UPS proxy server"
git push origin main
```

**If you haven't initialized Git yet:**
```bash
cd "C:\Users\Mike\Desktop\Budget manager"
git init
git add ups-proxy-server.js package.json
git commit -m "Add UPS proxy server"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## Step 2: Deploy to Railway from GitHub

### 2.1 Create New Service in Railway
1. In Railway (you should already be logged in)
2. Click the **"+ Create"** button (top right corner)
3. Select **"GitHub Repo"** from the dropdown menu

### 2.2 Select Your Repository
1. Railway will show a list of your GitHub repositories
2. Find and click on your **"Budget manager"** repository (or whatever it's named)
3. Click **"Deploy Now"** or **"Add Service"**

### 2.3 Configure the Service
1. Railway will automatically detect it's a Node.js project (from `package.json`)
2. It will automatically:
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)
3. Wait for deployment to complete (usually 1-2 minutes)

### 2.4 Get Your Deployment URL
1. Once deployed, click on your service name in Railway
2. Go to the **"Settings"** tab
3. Scroll down to **"Domains"** section
4. You'll see a URL like: `https://your-service-name.railway.app`
5. **Copy this URL** - you'll need it for your frontend!

### 2.5 Verify Deployment
1. Click on the **"Logs"** tab in Railway
2. You should see: `UPS Proxy Server running on port XXXX`
3. Test the health endpoint:
   - Open a new browser tab
   - Visit: `https://your-service-name.railway.app/health`
   - You should see: `{"status":"ok","service":"UPS Proxy Server"}`

## Step 3: Configure Your Frontend

### 3.1 Update Budget Manager Settings
1. Open your Budget Manager app (`index.html`)
2. Go to **Settings** tab
3. Scroll down to **"UPS Tracking API"** section
4. Find the **"Proxy Server URL"** field
5. Paste your Railway URL (e.g., `https://your-service-name.railway.app`)
6. Enter your **UPS Client ID**
7. Enter your **UPS Client Secret**
8. Click outside the fields (they auto-save)

### 3.2 Test the Connection
1. Click the **"Test UPS Tracking"** button
2. If successful, you'll see a success message
3. If it fails, check:
   - Railway logs for errors
   - That your Railway URL is correct
   - That your UPS credentials are correct

## Troubleshooting

### Problem: "No deploys for this service"
**Solution:** Make sure `package.json` is in the root of your GitHub repository

### Problem: Build fails in Railway
**Solution:** 
- Check Railway logs for the error
- Make sure `package.json` has correct dependencies
- Verify Node.js version is 14+ (Railway auto-detects)

### Problem: CORS errors
**Solution:** 
- Make sure your frontend domain (`https://oolab-budget.github.io`) is in the CORS origins list in `ups-proxy-server.js`
- The file already includes it, but verify it's correct

### Problem: Can't find repository in Railway
**Solution:**
- Make sure you've pushed the files to GitHub
- Check that Railway has access to your GitHub account
- Try refreshing the repository list in Railway

## Quick Checklist

- [ ] `ups-proxy-server.js` is in your GitHub repo
- [ ] `package.json` is in your GitHub repo
- [ ] Files are committed and pushed to GitHub
- [ ] Service is created in Railway
- [ ] Deployment completed successfully
- [ ] Health endpoint works (`/health`)
- [ ] Proxy URL is added to frontend settings
- [ ] UPS credentials are entered
- [ ] Test button works

## Next Steps After Deployment

Once everything is working:
1. Your UPS tracking will work automatically
2. The proxy server will handle all UPS API requests
3. Tracking status will update based on your check interval
4. You can monitor logs in Railway to see API requests


