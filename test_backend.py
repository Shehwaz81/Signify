#!/usr/bin/env python3
"""
Test script for Signify backend
"""

import requests
import json
import time
import sys

def test_backend():
    """Test the backend API endpoints"""
    base_url = "http://localhost:8000"
    
    print("Testing Signify Backend API...")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend. Is it running?")
        print("   Start backend with: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False
    
    # Test 2: Root endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✓ Root endpoint passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"✗ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Root endpoint error: {e}")
    
    # Test 3: API documentation
    print("\n3. Testing API documentation...")
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✓ API documentation accessible")
        else:
            print(f"✗ API documentation failed: {response.status_code}")
    except Exception as e:
        print(f"✗ API documentation error: {e}")
    
    print("\n" + "=" * 50)
    print("Backend testing completed!")
    print(f"API Documentation: {base_url}/docs")
    print(f"Backend URL: {base_url}")
    
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)
