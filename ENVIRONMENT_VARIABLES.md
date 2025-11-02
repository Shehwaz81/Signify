# 🔐 Environment Variables Guide

Complete list of all environment variables needed for backend and frontend deployment.

---

## 🖥️ Backend Environment Variables (Render)

### **Required Variables**

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `PORT` | `10000` | Port for the FastAPI server (Render sets this automatically) | `10000` |
| `PYTHONUNBUFFERED` | `1` | Ensures Python output is not buffered (for logging) | `1` |

### **CORS Configuration** (Required after frontend deployment)

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `CORS_ORIGINS` | Comma-separated URLs | Allowed frontend origins for CORS | `https://signify.vercel.app,https://signify-*.vercel.app,http://localhost:3000` |

**Important:** 
- Add your Vercel frontend URL here
- Include `https://signify-*.vercel.app` for preview deployments
- Keep `http://localhost:3000` for local development

### **Model Download Configuration** (Optional but Recommended)

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `MODEL_BASE_URL` | URL to model files | Base URL for downloading models on-demand | `https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/` |

**Where to host models:**
- GitHub Releases (free, easy): `https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/`
- Google Cloud Storage: `https://storage.googleapis.com/your-bucket/models/`
- AWS S3: `https://your-bucket.s3.amazonaws.com/models/`

**Note:** If not set, services will use fallback detection (still works, just less accurate for emotions).

### **Model Paths** (Optional - Advanced)

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `EMOTION_MODEL_PATH` | File path | Path to emotion detection model | `models/fer2013_mini_XCEPTION.102-0.66.hdf5` |
| `SIGN_LANGUAGE_MODEL_PATH` | File path | Path to sign language model | `models/sign_language_model.h5` |

**Default values:** These are already set in code, only override if needed.

### **Logging** (Optional - Advanced)

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `LOG_LEVEL` | Log level | Python logging level | `INFO` (options: DEBUG, INFO, WARNING, ERROR) |

---

## 📱 Frontend Environment Variables (Vercel)

### **Required Variables**

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend URL | URL of your deployed backend API | `https://signify-kfyn.onrender.com` |

**Important:** 
- Must start with `NEXT_PUBLIC_` to be accessible in the browser
- Use your Render backend URL (get from Render dashboard)
- For local development, use `http://localhost:8000`

---

## 📋 Quick Setup Checklist

### Backend (Render)

1. Go to Render Dashboard → Your Service → Environment
2. Add these variables:

```bash
# Required
PYTHONUNBUFFERED=1

# CORS (update after you get frontend URL)
CORS_ORIGINS=https://your-frontend.vercel.app,https://signify-*.vercel.app,http://localhost:3000

# Optional: Model download
MODEL_BASE_URL=https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/
```

### Frontend (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:

```bash
# Required
NEXT_PUBLIC_API_URL=https://signify-kfyn.onrender.com
```

**Important:** After adding variables:
- **Render**: Service will auto-restart
- **Vercel**: Click "Redeploy" for changes to take effect

---

## 🔄 Environment Variable Priority

### Backend
1. Environment variables (highest priority)
2. `.env` file (if exists locally)
3. Default values in code (lowest priority)

### Frontend
1. Vercel environment variables (production)
2. `.env.local` file (local development)
3. Hardcoded defaults in code (fallback: `http://localhost:8000`)

---

## 🧪 Local Development Setup

### Backend `.env` file (`backend/.env`)

```env
# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Optional: Model download URL
MODEL_BASE_URL=https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/

# Optional: Custom model paths
EMOTION_MODEL_PATH=models/fer2013_mini_XCEPTION.102-0.66.hdf5

# Optional: Logging
LOG_LEVEL=INFO
```

### Frontend `.env.local` file (`frontend/.env.local`)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📝 Example Values

### Production Backend (Render)

```bash
PORT=10000
PYTHONUNBUFFERED=1
CORS_ORIGINS=https://signify.vercel.app,https://signify-*.vercel.app,http://localhost:3000
MODEL_BASE_URL=https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/
```

### Production Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://signify-kfyn.onrender.com
```

---

## ⚠️ Important Notes

1. **CORS Origins**: Must match your frontend URL exactly (including protocol: `https://`)
2. **Frontend Variables**: Must start with `NEXT_PUBLIC_` to be accessible in browser
3. **Port Variable**: Render sets `PORT` automatically, don't override it
4. **Model URL**: Include trailing slash `/` in `MODEL_BASE_URL`
5. **Vercel Previews**: Use wildcard `signify-*.vercel.app` to allow preview deployments

---

## 🔍 How to Verify

### Backend
```bash
# Check health endpoint
curl https://signify-kfyn.onrender.com/health

# Should return:
# {"status":"healthy","services":{"emotion":true,"sign_language":true}}
```

### Frontend
- Open browser console (F12)
- Check for API errors
- Verify requests are going to correct backend URL

---

## 🐛 Troubleshooting

### CORS Errors?
- Verify `CORS_ORIGINS` includes your exact frontend URL
- Check protocol (`https://` vs `http://`)
- Ensure no trailing slashes in CORS URLs

### Frontend Can't Connect?
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check it starts with `NEXT_PUBLIC_`
- Redeploy Vercel after adding variables

### Model Download Fails?
- Check `MODEL_BASE_URL` is correct
- Verify model file is accessible (try URL in browser)
- Service will use fallback (still works!)

---

**Last Updated:** Based on current codebase configuration

