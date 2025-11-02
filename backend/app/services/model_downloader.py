"""
Model downloader utility - downloads models from cloud storage on demand
This saves Docker image size and memory
"""
import os
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

# GitHub releases URL for models (you can host models here)
MODEL_BASE_URL = os.getenv(
    "MODEL_BASE_URL",
    "https://github.com/Shehwaz81/Signify/releases/download/v1.0.0/"
)

def download_model_if_needed(model_path: str, model_name: str) -> bool:
    """
    Download model from cloud storage if it doesn't exist locally.
    Saves Docker image size by not including models.
    
    Args:
        model_path: Local path where model should be stored
        model_name: Name of model file to download
        
    Returns:
        True if model exists (either already local or downloaded), False otherwise
    """
    # If model already exists locally, use it
    if os.path.exists(model_path):
        logger.info(f"Model found at {model_path}")
        return True
    
    # Try to download from GitHub releases or cloud storage
    try:
        model_url = f"{MODEL_BASE_URL}{model_name}"
        logger.info(f"Downloading model from {model_url}...")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Download with progress
        response = requests.get(model_url, stream=True, timeout=60)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(model_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        if downloaded % (1024 * 1024) == 0:  # Log every MB
                            logger.info(f"Downloaded {downloaded / (1024*1024):.1f}MB / {total_size / (1024*1024):.1f}MB ({percent:.1f}%)")
        
        logger.info(f"Model downloaded successfully to {model_path}")
        return True
        
    except Exception as e:
        logger.warning(f"Could not download model {model_name}: {str(e)}")
        logger.info("Will use fallback emotion detection (MediaPipe-based)")
        return False

