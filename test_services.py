#!/usr/bin/env python3
"""
Test both backend and frontend services
"""

import requests
import time
import sys

def test_backend():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend is running!")
            print(f"   Response: {response.json()}")
            return True
    except Exception as e:
        print(f"X Backend error: {e}")
    return False

def test_frontend():
    """Test if frontend is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✓ Frontend is running!")
            print(f"   Status: {response.status_code}")
            return True
    except Exception as e:
        print(f"X Frontend error: {e}")
    return False

def main():
    print("Testing Signify Services...")
    print("=" * 40)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("\n" + "=" * 40)
    if backend_ok and frontend_ok:
        print("🎉 Both services are running!")
        print("📱 Frontend: http://localhost:3000")
        print("🔧 Backend: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
    elif backend_ok:
        print("⚠️  Backend is running, but frontend is not")
        print("🔧 Backend: http://localhost:8000")
    elif frontend_ok:
        print("⚠️  Frontend is running, but backend is not")
        print("📱 Frontend: http://localhost:3000")
    else:
        print("❌ Neither service is running")
    
    return backend_ok and frontend_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
