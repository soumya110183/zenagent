# Railway Deployment Guide - Code Lens v2

## Prerequisites
- Railway account (sign up at https://railway.app)
- Your email: ullas1@gmail.com
- GitHub account (optional but recommended)

## Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

#### Step 1: Push Code to GitHub
1. Create a new repository on GitHub
2. Initialize git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Code Lens v2"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/code-lens-v2.git
   git push -u origin main
   ```

#### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Sign in with GitHub (or email: ullas1@gmail.com)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `code-lens-v2` repository
6. Railway will automatically detect and deploy your Node.js app

#### Step 3: Configure Environment (Optional)
In Railway dashboard:
1. Click on your project
2. Go to **Variables** tab
3. Add these optional variables:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secure-random-secret-here
   PORT=5000
   ```

#### Step 4: Get Your URL
1. Go to **Settings** tab
2. Click **Generate Domain**
3. Your app will be available at: `https://your-app-name.up.railway.app`

---

### Method 2: Deploy from CLI

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway
```bash
railway login
```
Use email: ullas1@gmail.com

#### Step 3: Initialize and Deploy
```bash
railway init
railway up
```

#### Step 4: Add a Domain
```bash
railway domain
```

---

## Build Configuration

Railway will automatically:
- ✅ Detect Node.js application
- ✅ Run `npm install`
- ✅ Build with Vite
- ✅ Start with `npm start`

## Important Files Created

- **railway.json** - Railway configuration
- **Procfile** - Process configuration
- **.railwayignore** - Files to exclude from deployment

## Production Checklist

Before deploying, ensure:
- [x] Hardcoded credentials (amex/zensar) are in place
- [x] No database required (using in-memory storage)
- [x] Session uses MemoryStore (no PostgreSQL needed)
- [x] Build command is configured in package.json
- [x] Start command uses cross-env for production

## Environment Variables (Optional)

Add these in Railway dashboard if needed:

| Variable | Value | Required |
|----------|-------|----------|
| NODE_ENV | production | No (defaults to production) |
| PORT | 5000 | No (Railway sets automatically) |
| SESSION_SECRET | random-secret | No (hardcoded in app) |
| OPENAI_API_KEY | your-key | No (for AI features) |

## After Deployment

### Access Your Application
URL format: `https://code-lens-v2.up.railway.app`

### Login Credentials
- Username: **amex**
- Password: **zensar**

### Monitor Your App
1. View logs: Click **"Deployments"** → **"View Logs"**
2. Check metrics: See CPU, Memory, Network usage
3. Redeploy: Railway auto-deploys on git push

## Troubleshooting

### Build Fails
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### App Doesn't Start
- Check if `npm start` works locally
- Review Railway deployment logs
- Ensure PORT is not hardcoded (Railway assigns it)

### 502 Bad Gateway
- App might be crashing on start
- Check logs for errors
- Verify all required files are included

### Cannot Login
- Clear browser cookies
- Try incognito mode
- Verify credentials: amex/zensar

## Updating Your App

### With GitHub:
```bash
git add .
git commit -m "Update description"
git push
```
Railway will auto-deploy!

### With CLI:
```bash
railway up
```

## Cost

Railway offers:
- **Free tier**: $5 credit/month (enough for hobby projects)
- **Starter plan**: $5/month for more resources
- Your app should run fine on the free tier

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Status: https://status.railway.app

---

## Quick Reference

**Sign Up:** https://railway.app/login  
**Email:** ullas1@gmail.com  
**CLI Install:** `npm install -g @railway/cli`  
**Deploy:** `railway up`  
**Logs:** `railway logs`  

---

**Developed by Diamond Zensar Team**  
**Enterprise Application Intelligence Platform**
