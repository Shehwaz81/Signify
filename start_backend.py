#!/usr/bin/env python3
"""
Startup script for Signify backend
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    """Start the backend server"""
    backend_dir = Path(__file__).parent / "backend"
    
    print("🚀 Starting Signify Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        sys.exit(1)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Install requirements if needed
    print("📦 Installing requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        sys.exit(1)
    
    # Start the server
    print("🌐 Starting FastAPI server...")
    print("📍 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
