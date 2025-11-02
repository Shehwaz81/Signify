# 🚀 Signify Deployment Guide

Complete step-by-step guide to deploy Signify to production.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Final Configuration](#final-configuration)
6. [Testing Production](#testing-production)

---

## 📌 Overview

This guide will deploy:
- **Backend (FastAPI)** → **Render** (or Railway as alternative)
- **Frontend (Next.js)** → **Vercel**

### Why These Services?
- **Vercel**: Best for Next.js, automatic deployments, free tier, excellent performance
- **Render**: Good for Python backends, free tier available, easy setup
- **Railway**: Alternative to Render, faster, better free tier limits

---

## ✅ Prerequisites

Before starting:
- [ ] GitHub account (create at github.com if you don't have one)
- [ ] Render account (create at render.com)
- [ ] Vercel account (create at vercel.com)
- [ ] Your code pushed to GitHub (we'll do this)

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

First, let's make sure your backend is ready:

1. **Create a startup script for Render**

   Create a new file: `backend/render.yaml` (or we can use web service)
   
2. **Update CORS settings** (we'll do this in config)

3. **Prepare model files** (make sure they're in the repo or use a cloud storage)

### Step 2: Push Code to GitHub

```bash
# Navigate to your project root
cd C:\Users\tejas\Desktop\Signify

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/signify.git
git branch -M main
git push -u origin main
```

**⚠️ Important**: Make sure your `.gitignore` excludes:
- `venv/`
- `.env` (environment variables)
- `__pycache__/`
- `*.pyc`

But **INCLUDE**:
- `backend/models/` (your model files)
- All code files

### Step 3: Create Render Web Service

1. Go to [render.com](https://render.com) and sign up/login

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository:
   - Click **"Connect GitHub"**
   - Select your `signify` repository
   - Authorize Render

4. Configure the service:
   - **Name**: `signify-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   
5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   PYTHON_VERSION=3.10
   ```
   (We'll add CORS origins after frontend is deployed)

6. Click **"Create Web Service"**

7. **Wait for first deployment** (this takes 5-10 minutes)

8. **Copy your backend URL** (something like: `https://signify-backend.onrender.com`)

### Step 4: Update Backend CORS Settings

1. Go to your Render service → **Environment** tab

2. Add environment variable:
   ```
   CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
   ```
   (Update after you get your Vercel URL)

3. Update `backend/app/config.py` to read from environment:
   ```python
   cors_origins: list = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
   ```

### Step 5: Upload Model Files (if needed)

**Option A: If models are already in GitHub** - You're good!

**Option B: If models are too large for GitHub** (>100MB):
- Use Google Drive, Dropbox, or AWS S3
- Download models during build process
- Or use Render's persistent disk (paid feature)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API URL** to use environment variable

2. **Update Next.js config** for production API

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub

2. Click **"Add New..."** → **"Project"**

3. Import your GitHub repository:
   - Select your `signify` repository
   - Vercel auto-detects Next.js

4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

5. **Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_API_URL=https://signify-backend.onrender.com
   ```
   (Use your actual Render backend URL)

6. Click **"Deploy"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your frontend URL** (something like: `https://signify.vercel.app`)

### Step 3: Update Frontend API Calls

Update `frontend/app/emotion/page.tsx` and `frontend/app/real-time-sign/page.tsx`:

Replace:
```typescript
const response = await fetch('http://localhost:8000/emotion/detect', {
```

With:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const response = await fetch(`${apiUrl}/emotion/detect`, {
```

---

## 🔗 Final Configuration

### Step 1: Update Backend CORS

1. Go to Render → Your backend service → Environment

2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://signify.vercel.app,https://signify-git-main-yourusername.vercel.app,http://localhost:3000
   ```
   (Include your Vercel production URL and preview URLs)

3. Restart the service

### Step 2: Update Frontend Environment Variable

1. Go to Vercel → Your project → Settings → Environment Variables

2. Ensure `NEXT_PUBLIC_API_URL` is set to your Render backend URL

3. Redeploy frontend (or it will auto-deploy)

---

## ✅ Testing Production

1. **Test Backend Health**:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Test Frontend**:
   - Go to your Vercel URL
   - Test emotion detection
   - Test sign language recognition

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Check for any CORS errors
   - Verify API calls are going to production backend

---

## 🎯 Alternative: Railway Deployment (Backend)

If Render is too slow, use Railway:

1. Go to [railway.app](https://railway.app)

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your repository

4. Railway auto-detects Python:
   - **Root Directory**: `/backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add environment variable:
   ```
   PORT=${{PORT}}
   ```

6. Click **"Deploy"**

7. Get your Railway URL and update frontend `NEXT_PUBLIC_API_URL`

---

## 🐛 Troubleshooting

### Backend Issues:

**Problem**: Models not found
- **Solution**: Ensure model files are committed to GitHub or uploaded to cloud storage

**Problem**: Build fails
- **Solution**: Check `requirements.txt` for compatible versions, check Render logs

**Problem**: CORS errors
- **Solution**: Update `CORS_ORIGINS` environment variable with exact frontend URL

### Frontend Issues:

**Problem**: API calls failing
- **Solution**: Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel environment variables

**Problem**: Build fails
- **Solution**: Check Vercel build logs, ensure all dependencies are in `package.json`

**Problem**: 404 on routes
- **Solution**: Vercel should handle Next.js routing automatically, check `next.config.js`

---

## 📝 Notes

- **Free Tier Limits**:
  - Render: Services sleep after 15 minutes of inactivity (first request wakes them up)
  - Vercel: 100GB bandwidth/month, unlimited requests on free tier
  - Railway: $5 free credit/month

- **Custom Domain**:
  - Both services support custom domains
  - Vercel: Add domain in project settings
  - Render: Add custom domain in service settings

- **Continuous Deployment**:
  - Both auto-deploy on `git push` to main branch
  - Perfect for development workflow!

---

## 🎉 You're Done!

Your Signify app should now be live on:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

Share the frontend URL with anyone to use your app!

