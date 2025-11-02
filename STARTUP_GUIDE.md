# 🚀 Signify Startup Guide

This guide will help you get Signify up and running quickly!

## 📋 Prerequisites

- **Python 3.8+** (with pip)
- **Node.js 18+** (with npm)
- **Webcam** (for live testing)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🏃‍♂️ Quick Start

### Option 1: Automated Setup (Recommended)

1. **Start Backend:**
   ```bash
   python start_backend.py
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   start_frontend.bat
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Test Backend
```bash
python test_backend.py
```

### Test Frontend
1. Open http://localhost:3000
2. Navigate to "Emotion AI" page
3. Try capturing an image with your webcam
4. Test the emotion detection

### Test Sign Language Translation
1. Navigate to "Sign Language" page
2. Capture a hand gesture
3. Test the translation feature

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` or import errors
**Solution:** 
```bash
cd backend
pip install -r requirements.txt
```

**Problem:** Port 8000 already in use
**Solution:**
```bash
# Kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Problem:** CORS errors in frontend
**Solution:** Check that backend is running on http://localhost:8000

### Frontend Issues

**Problem:** `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

**Problem:** Webcam not working
**Solution:**
- Check browser permissions for camera access
- Try using HTTPS (some browsers require it for webcam)
- Test with different browsers

### General Issues

**Problem:** Services not communicating
**Solution:**
1. Ensure backend is running on port 8000
2. Ensure frontend is running on port 3000
3. Check firewall settings
4. Verify CORS configuration in backend

## 📱 Features to Test

### 1. Emotion Detection
- **Location:** http://localhost:3000/emotion
- **Test:** Capture a photo and analyze emotions
- **Expected:** Detected emotions with confidence scores

### 2. Sign Language Translation
- **Location:** http://localhost:3000/sign-language
- **Test:** Make hand gestures and translate them
- **Expected:** Text output with confidence scores

### 3. API Endpoints
- **Health:** http://localhost:8000/health
- **Docs:** http://localhost:8000/docs
- **Root:** http://localhost:8000/

## 🎯 Expected Results

### Backend Health Check
```json
{
  "status": "healthy",
  "services": {
    "emotion": true,
    "sign_language": true
  }
}
```

### Emotion Detection Response
```json
{
  "success": true,
  "emotions": [
    {
      "emotion": "Happy",
      "confidence": 0.85,
      "bounding_box": {"x": 100, "y": 50, "width": 200, "height": 200}
    }
  ],
  "message": "Emotion detection completed successfully"
}
```

### Sign Language Translation Response
```json
{
  "success": true,
  "text": "Hello",
  "confidence": 0.92,
  "message": "Sign language translation completed successfully"
}
```

## 🚀 Production Deployment

### Backend Deployment
1. Set environment variables
2. Use production WSGI server (Gunicorn)
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables
4. Set up custom domain

## 📞 Support

If you encounter issues:

1. **Check the logs** in both backend and frontend terminals
2. **Verify all dependencies** are installed correctly
3. **Test individual components** using the test scripts
4. **Check browser console** for frontend errors
5. **Review API documentation** at http://localhost:8000/docs

## 🎉 Success!

Once everything is running, you should see:
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Webcam access working
- ✅ Emotion detection functional
- ✅ Sign language translation working

**Happy coding with Signify! 🎊**
