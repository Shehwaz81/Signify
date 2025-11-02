# 🧠 Memory Optimization Guide

## Problem
Render's free tier has a **512MB memory limit**, which was being exceeded by:
- TensorFlow (~200-300MB)
- MediaPipe Holistic (~150-200MB) 
- Emotion model file (~60MB)
- Python runtime (~50MB)
- Total: ~460-610MB (over limit!)

## Solution Implemented

### 1. **Lazy Loading** (Saves ~400MB at startup)
- ✅ MediaPipe only loads on first sign language request
- ✅ Emotion model only loads on first emotion detection request
- ✅ Services start fast without loading heavy models

### 2. **Reduced MediaPipe Complexity** (Saves ~100MB)
- Changed from `model_complexity=2` → `model_complexity=0`
- Disabled `refine_face_landmarks` 
- Still accurate for sign language recognition!

### 3. **On-Demand Model Downloads** (Saves ~60MB Docker image size)
- Models no longer included in Docker image
- Downloaded from cloud storage on first use
- Docker image is now much smaller and faster to build

### 4. **TensorFlow Memory Optimization**
- Disabled GPU usage
- Limited thread parallelism
- Single worker configuration

## Expected Memory Usage Now

**At Startup:**
- Python runtime: ~50MB
- FastAPI/uvicorn: ~30MB
- OpenCV: ~20MB
- **Total: ~100MB** ✅ (was ~500MB+)

**After First Request:**
- +150MB for MediaPipe (if sign language used)
- +200MB for TensorFlow (if emotion detection used)
- **Peak: ~450MB** ✅ (under 512MB limit!)

## Model Hosting Options

Since models are now downloaded on-demand, you need to host them. Choose one:

### Option 1: GitHub Releases (Free, Easy) ⭐ Recommended

1. Go to your GitHub repo: https://github.com/Shehwaz81/Signify
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`, Title: `Model Files v1.0.0`
4. Upload `fer2013_mini_XCEPTION.102-0.66.hdf5` as an asset
5. The model will be available at:
   ```
   https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/fer2013_mini_XCEPTION.102-0.66.hdf5
   ```

**Update Render Environment Variable:**
```
MODEL_BASE_URL=https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/
```

### Option 2: Google Cloud Storage (Free tier available)

1. Create a bucket in Google Cloud Storage
2. Upload model file
3. Make it publicly accessible
4. Set `MODEL_BASE_URL` to your bucket URL

### Option 3: AWS S3 (Free tier available)

1. Create an S3 bucket
2. Upload model file
3. Make it publicly accessible
4. Set `MODEL_BASE_URL` to your bucket URL

### Option 4: Render Disk Storage (For persistent storage)

If you upgrade Render plan, you can use persistent disk storage.

## Configuration

### Environment Variables (Render Dashboard)

Add these to your Render service:

```bash
# Model download URL (use one of the options above)
MODEL_BASE_URL=https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/

# CORS origins (your frontend URL)
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# Optional: Custom model path
EMOTION_MODEL_PATH=models/fer2013_mini_XCEPTION.102-0.66.hdf5
```

## Fallback Behavior

If model download fails:
- ✅ **Emotion detection** will use MediaPipe-based fallback (still works, less accurate)
- ✅ **Sign language** will use MediaPipe only (works perfectly)

## Testing

After deployment:

1. **Check startup logs** - should see:
   ```
   Emotion service initialized (face cascade ready, model will load on first use)
   Sign language service ready (MediaPipe will initialize on first use)
   ```

2. **First emotion request** - should see:
   ```
   Downloading model from https://...
   Model downloaded successfully
   Emotion model loaded successfully
   ```

3. **Memory usage** - should be under 512MB at all times!

## Benefits

✅ **Faster deployments** - Smaller Docker image  
✅ **Lower memory usage** - Fits in free tier  
✅ **Faster startup** - No heavy model loading  
✅ **More flexible** - Easy to update models without redeploying  
✅ **Cost-effective** - Works on Render free tier  

## Troubleshooting

### Model download fails?
- Check `MODEL_BASE_URL` is set correctly
- Verify model file is accessible (try URL in browser)
- Service will use fallback (still works!)

### Still out of memory?
- Upgrade Render to Standard plan (2GB)
- Or use Railway (better free tier)

### Model downloads slowly?
- This is normal on first request (60MB file)
- Model is cached after first download
- Consider using CDN for faster downloads

