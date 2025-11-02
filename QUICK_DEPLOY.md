# ⚡ Quick Deployment Checklist

Follow these steps in order to deploy Signify:

## 📦 Step 1: Push to GitHub (5 minutes)

```bash
# In your project root
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/signify.git
git push -u origin main
```

---

## 🔧 Step 2: Deploy Backend to Render (10 minutes)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `signify-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **"Create Web Service"**
6. ⏳ Wait for deployment (5-10 min)
7. **Copy your backend URL** (e.g., `https://signify-backend.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login (with GitHub)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
5. **Add Environment Variable**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://signify-backend.onrender.com` (your Render URL)
6. Click **"Deploy"**
7. ⏳ Wait for deployment (2-3 min)
8. **Copy your frontend URL** (e.g., `https://signify.vercel.app`)

---

## 🔗 Step 4: Connect Backend & Frontend (2 minutes)

1. Go back to **Render** → Your backend service → **Environment**
2. Add/Update environment variable:
   - Key: `CORS_ORIGINS`
   - Value: `https://signify.vercel.app,https://signify-*.vercel.app` (your Vercel URL + wildcard for previews)
3. Click **"Save Changes"** → Render will auto-restart

---

## ✅ Step 5: Test (2 minutes)

1. Visit your Vercel URL: `https://signify.vercel.app`
2. Test Emotion Detection
3. Test Sign Language Recognition
4. Check browser console (F12) for errors

---

## 🎉 Done!

Your app is live at: **`https://signify.vercel.app`**

---

## 🆘 Quick Troubleshooting

**CORS errors?**
→ Update `CORS_ORIGINS` in Render with exact Vercel URL

**API not working?**
→ Check `NEXT_PUBLIC_API_URL` in Vercel environment variables

**Backend not responding?**
→ Render free tier sleeps after 15min - first request wakes it up (takes ~30s)

---

**Full detailed guide**: See `DEPLOYMENT_GUIDE.md`

