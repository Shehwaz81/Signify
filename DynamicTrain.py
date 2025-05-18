import cv2
import numpy as np
import mediapipe as mp
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical
import tensorflow as tf

# ——— Configuration ————————————————————————————————
LABELS = ['J', 'Z']
SAMPLES_PER_CLASS = 100
BUFFER_LENGTH = 15

# ——— MediaPipe & Webcam Setup ————————————————————
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)

# Ensure webcam opens
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Could not open webcam.")
    exit()

data = []
labels = []

# ——— Collect Motion Data ——————————————————————————
def collect_data(label):
    print(f"⏳ Collecting motion data for '{label}'...")
    collected = 0
    buffer = []

    while collected < SAMPLES_PER_CLASS:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error: Frame not read correctly.")
            continue

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = hands.process(rgb)

        if res.multi_hand_landmarks:
            hand = res.multi_hand_landmarks[0]
            mp_drawing.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)

            # Use index finger tip (landmark 8)
            x8, y8 = hand.landmark[8].x, hand.landmark[8].y
            buffer.append((x8, y8))

            if len(buffer) > BUFFER_LENGTH:
                buffer.pop(0)

            if len(buffer) == BUFFER_LENGTH:
                flat = np.array(buffer).flatten()
                data.append(flat)
                labels.append(label)
                collected += 1
                buffer.clear()

        # Progress text
        cv2.putText(frame, f"{label}: {collected}/{SAMPLES_PER_CLASS}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("✋ Motion Data Collection", frame)

        # Exit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("👋 Quit manually.")
            break

# ——— Data Collection Loop ————————————————————————
for label in LABELS:
    input(f"\n➡️ Press ENTER to start collecting for '{label}'...")
    collect_data(label)

cap.release()
cv2.destroyAllWindows()

# ——— Model Training ——————————————————————————————
print("🧠 Training motion recognition model...")

X = np.array(data)
y = np.array(labels)

encoder = LabelEncoder()
y_enc = to_categorical(encoder.fit_transform(y))

X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)

model = Sequential([
    Dense(64, activation='relu', input_shape=(BUFFER_LENGTH * 2,)),
    Dense(32, activation='relu'),
    Dense(len(LABELS), activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, epochs=20, batch_size=8, validation_data=(X_test, y_test))

model.save("motion_model_jz.h5")
print("✅ Model saved as 'motion_model_jz.h5'")
