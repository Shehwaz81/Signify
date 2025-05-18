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
        model = load_model(model_path, compile=False)
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

def draw_overlay(frame, text_lines, position=(10, 30), line_height=30):
    overlay = frame.copy()
    for i, line in enumerate(text_lines):
        y = position[1] + i * line_height
        cv2.putText(overlay, line, (position[0], y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    return overlay

def draw_panel(frame, emotion_text):
    height, width, _ = frame.shape

    panel_height = 80
    panel_color = (50, 50, 50)
    alpha = 0.6

    # Draw transparent panel at the bottom
    panel = frame.copy()
    cv2.rectangle(panel, (0, height - panel_height), (width, height), panel_color, -1)
    frame = cv2.addWeighted(panel, alpha, frame, 1 - alpha, 0)

    # Instructions & emotion
    instructions = "Press 'Q' to Quit | Press 'S' to Save Screenshot"
    cv2.putText(frame, instructions, (20, height - 50), cv2.FONT_HERSHEY_SIMPLEX,
                0.6, (255, 255, 255), 2, cv2.LINE_AA)

    if emotion_text:
        cv2.putText(frame, f"Emotion: {emotion_text}", (20, height - 20), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (255, 255, 255), 2, cv2.LINE_AA)

    return frame

def main():
    model = initialize_model()
    if model is None:
        return

    cap = initialize_camera()
    if cap is None:
        return

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if face_cascade.empty():
        print("[ERROR] Failed to load face cascade classifier.")
        cap.release()
        return

    emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    frame_count = 0
    emotion_display = None

    print("\n[INFO] GUI running. Press 'q' to quit, 's' to save frame.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to read from webcam.")
            break

        frame_count += 1
        if frame_count % 2 != 0:
            continue

        display_frame = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            roi_gray = cv2.resize(roi_gray, (64, 64))
            roi = roi_gray.astype("float") / 255.0
            roi = img_to_array(roi)
            roi = np.expand_dims(roi, axis=0)

            preds = model.predict(roi, verbose=0)[0]
            emotion_idx = preds.argmax()
            emotion_probability = preds[emotion_idx]
            emotion_display = f"{emotion_labels[emotion_idx]} ({emotion_probability:.2f})"

            # Draw face box
            cv2.rectangle(display_frame, (x, y), (x + w, y + h), (102, 255, 255), 2)
            cv2.putText(display_frame, emotion_display, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)

        # Add overlay panel
        display_frame = draw_panel(display_frame, emotion_display)

        # Show frame
        cv2.imshow('Beautiful Facial Emotion Recognition', display_frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("[INFO] Quitting...")
            break
        elif key == ord('s'):
            filename = f"emotion_capture_{len(os.listdir('.'))}.jpg"
            cv2.imwrite(filename, display_frame)
            print(f"[INFO] Frame saved as {filename}")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
