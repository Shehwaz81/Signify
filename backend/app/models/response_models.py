"""
Pydantic models for API responses
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EmotionDetection(BaseModel):
    """Individual emotion detection result"""
    emotion: str
    confidence: float
    bounding_box: Optional[Dict[str, int]] = None

class EmotionResponse(BaseModel):
    """Response model for emotion detection"""
    success: bool
    emotions: List[EmotionDetection]
    message: str

class SignLanguageResponse(BaseModel):
    """Response model for sign language translation"""
    success: bool
    text: str
    confidence: float
    message: str

class CombinedResponse(BaseModel):
    """Response model for combined analysis"""
    success: bool
    emotions: List[EmotionDetection]
    sign_language: str
    confidence: float
    message: str

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    services: Dict[str, bool]
