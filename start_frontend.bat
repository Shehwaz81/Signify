@echo off
echo 🚀 Starting Signify Frontend...
echo ================================================

cd frontend

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo 🌐 Starting Next.js development server...
echo 📍 Frontend will be available at: http://localhost:3000
echo ================================================

call npm run dev
