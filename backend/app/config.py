"""
Configuration settings for the Signify backend
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    api_title: str = "Signify API"
    api_version: str = "1.0.0"
    debug: bool = False
    
    # Model paths
    emotion_model_path: str = "models/fer2013_mini_XCEPTION.102-0.66.hdf5"
    sign_language_model_path: str = "models/sign_language_model.h5"
    
    # MediaPipe settings
    mediapipe_hands_model_complexity: int = 1
    mediapipe_hands_min_detection_confidence: float = 0.5
    mediapipe_hands_min_tracking_confidence: float = 0.5
    
    # Emotion detection settings
    emotion_confidence_threshold: float = 0.3
    
    # CORS settings
    cors_origins_str: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    
    @property
    def cors_origins(self) -> list:
        """Parse CORS origins from environment variable"""
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()
