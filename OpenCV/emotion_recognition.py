import cv2
import numpy as np
import os
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

def initialize_model():
    print("[INFO] Importing TensorFlow and Keras...")
    model_path = 'models/fer2013_mini_XCEPTION.102-0.66.hdf5'
    if not os.path.exists(model_path):
        print(f"[ERROR] Model file not found at {model_path}")
        return None
    
    try:
        print("[INFO] Loading model...")
        # Load model without compiling
        model = load_model(model_path, compile=False)
        
        # Recompile with current optimizer (not legacy)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model
    except Exception as e:
        print(f"[ERROR] Failed to load model: {str(e)}")
        return None

def initialize_camera():
    print("[INFO] Starting video capture...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open webcam.")
        return None
    return cap

def main():
    # Initialize model
    model = initialize_model()
    if model is None:
        return

    # Initialize camera
    cap = initialize_camera()
    if cap is None:
        return

    # Load face cascade classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        print("[ERROR] Failed to load face cascade classifier.")
        cap.release()
        return

    emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    
    print("\n[INFO] Press 'q' to quit")
    print("[INFO] Press 's' to save the current frame")

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to read from webcam.")
            break

        # Process every other frame for better performance
        frame_count += 1
        if frame_count % 2 != 0:
            continue

        # Create a copy for display
        display_frame = frame.copy()
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            # Extract and preprocess the face ROI
            roi_gray = gray[y:y+h, x:x+w]
            roi_gray = cv2.resize(roi_gray, (64, 64))
            roi = roi_gray.astype("float") / 255.0
            roi = img_to_array(roi)
            roi = np.expand_dims(roi, axis=0)

            # Make prediction
            preds = model.predict(roi, verbose=0)[0]
            emotion_idx = preds.argmax()
            emotion_probability = preds[emotion_idx]
            label = f"{emotion_labels[emotion_idx]}: {emotion_probability:.2f}"

            # Draw rectangle and label
            cv2.rectangle(display_frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(display_frame, label, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

        # Display the frame
        cv2.imshow('Facial Emotion Recognition', display_frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("[INFO] Quitting...")
            break
        elif key == ord('s'):
            # Save the current frame
            filename = f"emotion_capture_{len(os.listdir('.'))}.jpg"
            cv2.imwrite(filename, display_frame)
            print(f"[INFO] Frame saved as {filename}")

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()