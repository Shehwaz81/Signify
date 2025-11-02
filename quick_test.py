#!/usr/bin/env python3
"""
Quick test to verify the backend works
"""

import requests
import time
import sys

def test_backend():
    """Test if backend is running"""
    print("Testing backend connection...")
    
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                print("✓ Backend is running!")
                print(f"Response: {response.json()}")
                return True
        except requests.exceptions.ConnectionError:
            print(f"Attempt {attempt + 1}/{max_attempts}: Backend not ready yet...")
            time.sleep(2)
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(2)
    
    print("X Backend is not responding")
    return False

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)
