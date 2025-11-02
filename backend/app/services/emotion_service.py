"""
Emotion detection service using pre-trained models
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io
import logging
from typing import List, Dict, Any
import os

from ..config import settings

logger = logging.getLogger(__name__)

class EmotionService:
    """Service for emotion detection using pre-trained models"""
    
    def __init__(self):
        self.model = None
        self.face_cascade = None
        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        self.is_initialized = False
        self.model_loaded = False
        # Only initialize face cascade, load model lazily on first use
        self._initialize_face_cascade()
    
    def _initialize_face_cascade(self):
        """Initialize face cascade classifier (lightweight, fast to load)"""
        try:
            # Load face cascade
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            
            if self.face_cascade.empty():
                logger.error("Failed to load face cascade classifier")
                return
            
            self.is_initialized = True
            logger.info("Emotion service initialized (face cascade ready, model will load on first use)")
            
        except Exception as e:
            logger.error(f"Failed to initialize emotion service: {str(e)}")
            self.is_initialized = False
    
    def _load_emotion_model(self):
        """Lazy load emotion model only when needed (saves memory at startup)"""
        if self.model_loaded:
            return
        
        try:
            # Configure TensorFlow to use memory growth (prevents OOM)
            import tensorflow as tf
            # Limit CPU memory growth
            try:
                # Set TensorFlow to limit memory allocation
                tf.config.set_visible_devices([], 'GPU')  # Disable GPU to save memory
                # Set memory growth for CPU operations
                tf.config.threading.set_inter_op_parallelism_threads(1)
                tf.config.threading.set_intra_op_parallelism_threads(1)
            except Exception as e:
                logger.warning(f"Could not configure TensorFlow memory: {e}")
            
            # Load emotion model if it exists, try downloading if not
            model_path = settings.emotion_model_path
            model_name = os.path.basename(model_path)
            
            # Try to download model if it doesn't exist
            if not os.path.exists(model_path):
                from .model_downloader import download_model_if_needed
                download_model_if_needed(model_path, model_name)
            
            if os.path.exists(model_path):
                try:
                    logger.info(f"Loading emotion model from {model_path}...")
                    # Load model without compiling to avoid optimizer compatibility issues
                    self.model = load_model(model_path, compile=False)
                    logger.info("Emotion model loaded successfully")
                    self.model_loaded = True
                except Exception as load_error:
                    logger.warning(f"Could not load emotion model with compile=False, trying with compile=True: {str(load_error)}")
                    try:
                        # Try loading with compile=True as fallback
                        self.model = load_model(model_path)
                        logger.info("Emotion model loaded successfully (with compilation)")
                        self.model_loaded = True
                    except Exception as fallback_error:
                        logger.error(f"Failed to load emotion model: {str(fallback_error)}")
                        self.model = None
                        self.model_loaded = False
            else:
                logger.warning(f"Emotion model not found at {model_path}, using fallback")
                self.model = None
                self.model_loaded = True  # Mark as loaded so we don't keep trying
                
        except Exception as e:
            logger.error(f"Failed to load emotion model: {str(e)}")
            self.model = None
            self.model_loaded = True  # Mark as loaded to prevent retries
    
    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.is_initialized
    
    async def detect_emotions(self, image_data: bytes) -> Dict[str, Any]:
        """
        Detect emotions in an image
        
        Args:
            image_data: Image bytes
            
        Returns:
            Dictionary containing detected emotions
        """
        # Lazy load model on first use
        if not self.model_loaded:
            self._load_emotion_model()
        
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_data))
            image = image.convert('RGB')
            frame = np.array(image)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            # Detect faces
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            emotions = []
            
            for (x, y, w, h) in faces:
                try:
                    # Extract face ROI
                    roi_gray = gray[y:y+h, x:x+w]
                    roi_gray = cv2.resize(roi_gray, (64, 64))
                    
                    # Normalize
                    roi = roi_gray.astype("float") / 255.0
                    roi = img_to_array(roi)
                    roi = np.expand_dims(roi, axis=0)
                    
                    if self.model is not None:
                        # Use pre-trained model
                        preds = self.model.predict(roi, verbose=0)[0]
                        emotion_idx = np.argmax(preds)
                        confidence = float(preds[emotion_idx])
                        emotion = self.emotion_labels[emotion_idx]
                    else:
                        # Fallback: basic emotion estimation based on face features
                        emotion, confidence = self._estimate_emotion_fallback(roi_gray)
                    
                    if confidence >= settings.emotion_confidence_threshold:
                        emotions.append({
                            "emotion": emotion,
                            "confidence": confidence,
                            "bounding_box": {
                                "x": int(x),
                                "y": int(y),
                                "width": int(w),
                                "height": int(h)
                            }
                        })
                        
                except Exception as e:
                    logger.error(f"Error processing face: {str(e)}")
                    continue
            
            return {"emotions": emotions}
            
        except Exception as e:
            logger.error(f"Emotion detection error: {str(e)}")
            return {"emotions": []}
    
    def _estimate_emotion_fallback(self, face_roi: np.ndarray) -> tuple:
        """
        Fallback emotion estimation when model is not available
        This is a simple heuristic-based approach
        """
        # Simple heuristic: analyze face geometry
        height, width = face_roi.shape
        
        # Calculate basic features
        center_x, center_y = width // 2, height // 2
        
        # Simple feature extraction
        eye_region = face_roi[height//4:height//2, width//4:3*width//4]
        mouth_region = face_roi[3*height//4:height, width//4:3*width//4]
        
        # Basic emotion estimation based on brightness and contrast
        eye_brightness = np.mean(eye_region)
        mouth_brightness = np.mean(mouth_region)
        
        # Simple heuristics
        if eye_brightness > 150:
            return "Happy", 0.7
        elif mouth_brightness < 100:
            return "Sad", 0.6
        else:
            return "Neutral", 0.5
