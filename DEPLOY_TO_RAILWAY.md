# 🚀 Deploy Code Lens v2 to Railway - Quick Guide

**Your Railway Email:** ullas1@gmail.com

---

## ⚡ Fastest Method (5 Minutes)

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository name: `code-lens-v2`
3. Keep it **Private** or **Public** (your choice)
4. Click **Create repository**

### Step 2: Push Your Code
Open terminal/command prompt in your project folder:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy Code Lens v2 to Railway"

# Add GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/code-lens-v2.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Railway
1. Go to **https://railway.app**
2. Click **Login** → Use email: **ullas1@gmail.com**
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Authorize GitHub access
6. Select your `code-lens-v2` repository
7. Click **Deploy Now**

### Step 4: Wait for Build
Railway will automatically:
- ✅ Install dependencies
- ✅ Build your app
- ✅ Deploy to production

This takes about 2-3 minutes.

### Step 5: Get Your Live URL
1. In Railway dashboard, click your project
2. Go to **Settings** tab
3. Click **Generate Domain**
4. Your app URL: `https://code-lens-v2.up.railway.app`

---

## 🎉 Your App is Live!

**Access:** Open the Railway URL in your browser  
**Login:** Username: `amex` | Password: `zensar`

---

## 📋 Optional: Add Environment Variables

In Railway dashboard → **Variables** tab, add:

```
NODE_ENV=production
SESSION_SECRET=your-random-secret-here
```

**Note:** These are optional - the app works without them!

---

## 🔄 Update Your App Later

To deploy updates:

```bash
git add .
git commit -m "Update description"
git push
```

Railway automatically redeploys! 🎯

---

## 💰 Pricing

- **Free Tier:** $5 credit/month (Perfect for testing!)
- **Hobby:** $5/month for unlimited resources
- Code Lens v2 runs fine on free tier

---

## ❓ Need Help?

**Railway Docs:** https://docs.railway.app  
**Support:** Railway Discord or support@railway.app  
**Your Email:** ullas1@gmail.com

---

## ✅ Deployment Checklist

- [x] Railway configuration files created
- [x] Hardcoded login (amex/zensar)
- [x] No database setup needed
- [x] Build scripts configured
- [x] Ready to deploy!

---

**Developed by Diamond Zensar Team**  
**Enterprise Application Intelligence Platform**
