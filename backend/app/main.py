"""
Signify Backend - AI-powered Sign Language Translation and Emotion Detection
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from typing import List, Dict, Any
import io
from PIL import Image
import numpy as np
import time

from .services.emotion_service import EmotionService
from .services.sign_language_service import SignLanguageService
from .models.response_models import EmotionResponse, SignLanguageResponse, CombinedResponse
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Signify API",
    description="AI-powered Sign Language Translation and Emotion Detection",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code} for {request.method} {request.url.path}")
    return response

# Initialize services with lazy loading (saves memory at startup)
# Services will only load heavy models when first request comes in
emotion_service = EmotionService()
sign_language_service = SignLanguageService()

logger.info("Services initialized (models will load on first request to save memory)")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Signify API",
        "version": "1.0.0",
        "endpoints": {
            "emotion": "/emotion/detect",
            "sign_language": "/sign-language/translate",
            "combined": "/analyze/combined",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "services": {
        "emotion": emotion_service.is_ready(),
        "sign_language": sign_language_service.is_ready()
    }}

@app.post("/emotion/detect", response_model=EmotionResponse)
async def detect_emotion(file: UploadFile = File(...)):
    """
    Detect emotions from an uploaded image
    """
    try:
        logger.info(f"Received emotion detection request - filename: {file.filename}, content_type: {file.content_type}")
        
        # Read image data
        image_data = await file.read()
        logger.info(f"Read {len(image_data)} bytes of image data")
        
        # Process with emotion service
        result = await emotion_service.detect_emotions(image_data)
        logger.info(f"Emotion detection result: {result.get('emotions', [])}")
        
        return EmotionResponse(
            success=True,
            emotions=result.get("emotions", []),
            message="Emotion detection completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Emotion detection error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Emotion detection failed: {str(e)}")

@app.post("/sign-language/translate", response_model=SignLanguageResponse)
async def translate_sign_language(file: UploadFile = File(...)):
    """
    Translate sign language gestures to text
    """
    try:
        # Read image data
        image_data = await file.read()
        
        # Process with sign language service
        result = await sign_language_service.translate_gesture(image_data)
        
        return SignLanguageResponse(
            success=True,
            text=result.get("text", ""),
            confidence=result.get("confidence", 0.0),
            message="Sign language translation completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Sign language translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sign language translation failed: {str(e)}")

@app.post("/analyze/combined", response_model=CombinedResponse)
async def analyze_combined(file: UploadFile = File(...)):
    """
    Combined analysis: detect emotions and translate sign language
    """
    try:
        # Read image data
        image_data = await file.read()
        
        # Process both services
        emotion_result = await emotion_service.detect_emotions(image_data)
        sign_result = await sign_language_service.translate_gesture(image_data)
        
        return CombinedResponse(
            success=True,
            emotions=emotion_result.get("emotions", []),
            sign_language=sign_result.get("text", ""),
            confidence=sign_result.get("confidence", 0.0),
            message="Combined analysis completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Combined analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Combined analysis failed: {str(e)}")

@app.post("/sign-language/continuous")
async def continuous_sign_recognition(file: UploadFile = File(...)):
    """
    Continuous sign language recognition for video streams
    Optimized for real-time processing
    """
    try:
        logger.info(f"Received sign language recognition request - filename: {file.filename}, content_type: {file.content_type}")
        
        # Read image data
        image_data = await file.read()
        logger.info(f"Read {len(image_data)} bytes of image data")
        
        # Process with sign language service
        result = await sign_language_service.translate_gesture(image_data)
        logger.info(f"Sign language recognition result: {result.get('text', '')}, confidence: {result.get('confidence', 0.0)}")
        
        # Return simplified response for real-time processing
        gesture_text = result.get("text", "")
        # Check if it's a temporal gesture (moving letters or common gestures)
        is_temporal = gesture_text in ["J", "Z", "Hello", "Thank you", "Please"] or any(
            word in gesture_text for word in ["J", "Z", "Hello", "Thank", "Please"]
        )
        
        return {
            "success": True,
            "gesture": gesture_text,
            "confidence": result.get("confidence", 0.0),
            "timestamp": time.time(),
            "is_temporal": is_temporal
        }
        
    except Exception as e:
        logger.error(f"Continuous sign recognition error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Continuous recognition failed: {str(e)}")

@app.get("/sign-language/gestures")
async def get_available_gestures():
    """
    Get list of available gestures and their descriptions
    """
    try:
        gestures = {
            "static_letters": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"],
            "moving_letters": ["J", "Z"],
            "common_gestures": ["HELLO", "GOODBYE", "THANK_YOU", "PLEASE", "SORRY", "YES", "NO"],
            "numbers": ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"],
            "colors": ["RED", "BLUE", "GREEN", "YELLOW", "BLACK", "WHITE", "BROWN", "PINK"],
            "emotions": ["HAPPY", "SAD", "ANGRY", "EXCITED", "TIRED", "SICK", "HUNGRY", "THIRSTY"]
        }
        
        return {
            "success": True,
            "gestures": gestures,
            "total_count": sum(len(v) for v in gestures.values()),
            "message": "Available gestures retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Get gestures error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get gestures: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
