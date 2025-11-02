# 🔧 Render Deployment Fix Guide

## Issues Fixed

### 1. **Out of Memory (512MB Limit)**
- **Problem**: TensorFlow + MediaPipe exceeded Render's free tier 512MB limit
- **Solution**: 
  - Implemented lazy loading for emotion model (loads on first request, not at startup)
  - Optimized TensorFlow memory usage
  - Single worker configuration
  - Memory-efficient Docker image

### 2. **Missing Model File**
- **Problem**: Emotion model not found in Docker container
- **Solution**: Updated Dockerfile to copy model files correctly

## 🚀 Deployment Steps

### Option 1: Deploy with Dockerfile (Recommended)

1. **In Render Dashboard:**
   - Go to your service → Settings
   - Under "Build & Deploy":
     - **Root Directory**: `backend`
     - **Dockerfile Path**: `Dockerfile`
     - **Docker Context**: `.` (or leave blank)

2. **Environment Variables:**
   ```
   PORT=10000
   PYTHONUNBUFFERED=1
   CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:3000
   ```

3. **Important:** Upgrade to **Starter Plan** ($7/month) or **Standard Plan** ($25/month) for more memory:
   - Free tier: 512MB (may still cause issues)
   - Starter: 512MB (better performance)
   - Standard: 2GB (recommended for production)

### Option 2: Use render.yaml

1. **In Render Dashboard:**
   - Go to "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will detect `render.yaml` automatically

2. **The render.yaml includes:**
   - Dockerfile path
   - Environment variables
   - Health check path
   - Plan selection

## 🎯 Alternative: Railway (More Memory-Friendly)

If Render continues to have memory issues, use Railway:

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Set root directory to `backend`
4. Railway provides 512MB free tier with better memory management
5. Can upgrade to $5/month for 2GB

## 📝 What Changed

### Files Created/Updated:
1. **backend/Dockerfile** - Optimized Docker image with memory settings
2. **backend/.dockerignore** - Excludes unnecessary files
3. **backend/render.yaml** - Render deployment configuration
4. **backend/app/services/emotion_service.py** - Lazy loading implementation
5. **backend/app/config.py** - Environment variable support for model paths

### Memory Optimizations:
- Emotion model loads on first request (not at startup)
- TensorFlow configured for minimal memory usage
- Single worker to reduce memory footprint
- Slim Python base image

## ⚠️ Important Notes

1. **Model File Size**: The emotion model (~60MB) needs to be in your GitHub repo or downloaded during build
2. **Memory Requirements**: Even with optimizations, you may need at least 1GB RAM for stable operation
3. **First Request**: First emotion detection request will be slower (model loading)
4. **Health Check**: Extended start period (60s) to account for model downloads

## 🧪 Testing

After deployment, test:
```bash
# Health check
curl https://your-backend.onrender.com/health

# Should return:
# {"status":"healthy","services":{"emotion":true,"sign_language":true}}
```

## 🔍 Troubleshooting

### Still Getting Out of Memory?
1. Upgrade Render plan to Standard ($25/month, 2GB RAM)
2. Or switch to Railway (better free tier handling)
3. Consider using cloud storage for models and downloading on-demand

### Model Not Found?
1. Verify model file exists in `backend/models/`
2. Check Dockerfile copies models correctly
3. Check logs for exact path being used

### Build Fails?
1. Check Dockerfile syntax
2. Verify all dependencies in requirements.txt
3. Check Render build logs for specific errors

