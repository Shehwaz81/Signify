import cv2
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class EmotionAnalyzer:
    def __init__(self, model_path='models/fer2013_mini_XCEPTION.102-0.66.hdf5'):
        logging.info("Initializing EmotionAnalyzer...")
        self.model_path = model_path
        self.model = self.load_emotion_model()
        self.face_cascade = self.load_face_cascade()
        self.emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        logging.info("EmotionAnalyzer initialization finished.")


    def load_emotion_model(self):

        if not os.path.exists(self.model_path):
            logging.error(f"Model file not found at {self.model_path}")
            return None

        try:
            logging.info("Loading model...")
          
            model = load_model(self.model_path)

            logging.info("Model loaded successfully.")
            return model
        except Exception as e:
            logging.error(f"Failed to load model: {str(e)}")
            return None

    def load_face_cascade(self):
        # Use an absolute path or ensure the haarcascades are accessible
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        if not os.path.exists(cascade_path):
             logging.error(f"Face cascade file not found at {cascade_path}")

        face_cascade = cv2.CascadeClassifier(cascade_path)

        if face_cascade.empty():
            logging.error(f"Failed to load face cascade classifier from {cascade_path}.")
            return None
        logging.info("Face cascade classifier loaded.")
        return face_cascade

    def analyze_frame(self, image_bytes: bytes):
        if self.model is None or self.face_cascade is None:
            logging.error("Model or cascade not loaded, cannot analyze frame.")
            return [] # Return empty list if not initialized


        try:
            image = Image.open(io.BytesIO(image_bytes))
            
            image = image.convert('RGB')
            frame = np.array(image)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        except Exception as e:
            logging.error(f"Failed to read or convert image bytes: {str(e)}")
            return []

        if frame is None or frame.size == 0:
             logging.error("Converted frame is empty.")
             return []

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE 
        )

        detections = []
        for (x, y, w, h) in faces:
            # Extract and preprocess the face ROI
            roi_gray = gray[y:y+h, x:x+w]
            try:
                # Resize to the model's expected input size
                roi_gray = cv2.resize(roi_gray, (64, 64))

                # Normalize and prepare for model prediction
                roi = roi_gray.astype("float") / 255.0
                roi = img_to_array(roi)
                roi = np.expand_dims(roi, axis=0) # Add batch dimension

                # Make prediction
                preds = self.model.predict(roi, verbose=0)[0] # Get the first (and only) prediction result
                emotion_idx = np.argmax(preds) # Use numpy argmax
                emotion_probability = preds[emotion_idx]
                label = f"{self.emotion_labels[emotion_idx]}: {emotion_probability:.2f}"

                detections.append({
                    "box": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}, # Ensure integers
                    "emotion": label
                })

            except Exception as e:
                logging.error(f"Error processing face ROI at ({x},{y},{w},{h}): {str(e)}")
                continue 

        return detections


try:
    emotion_analyzer = EmotionAnalyzer()
    if not is_analyzer_ready():
        logging.warning("EmotionAnalyzer might not be fully ready after instantiation. Check logs.")
except Exception as e:
    logging.critical(f"Failed to instantiate EmotionAnalyzer: {str(e)}")
    emotion_analyzer = None 


def is_analyzer_ready():
    return emotion_analyzer is not None and emotion_analyzer.model is not None and emotion_analyzer.face_cascade is not None
