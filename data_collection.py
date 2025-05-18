# data_collection.py

import cv2
import mediapipe as mp
import csv
import os

# — Configurable parameters —
DATA_DIR = 'data'
CSV_PATH = os.path.join(DATA_DIR, 'landmarks.csv')
LETTERS = [chr(i) for i in range(65, 91)]   # A–Z
SAMPLES_PER_LETTER = 5000                   # adjust as needed

# — Initialize MediaPipe & OpenCV window —
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("ERROR: Could not open webcam.")
    exit(1)

# — Prepare CSV file with header —
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, 'w', newline='') as f:
        writer = csv.writer(f)
        header = [f"{axis}{i}" for axis in ('x','y','z') for i in range(21)] + ['label']
        writer.writerow(header)

print("Starting data collection.")
print("Will collect %d samples for each letter A–Z." % SAMPLES_PER_LETTER)

for letter in LETTERS:
    # Wait for user to press 's' to start this letter
    print(f"\nGet ready for letter '{letter}'. Press 's' in the window to start.")
    while True:
        ret, frame = cap.read()
        if not ret: continue
        frame = cv2.flip(frame, 1)
        cv2.putText(frame, f"Ready for '{letter}': press 's' to start", 
                    (10,30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
        cv2.imshow('Data Collection', frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            break
        if key == ord('q'):
            print("Exiting.")
            cap.release()
            cv2.destroyAllWindows()
            exit(0)

    # Collect samples
    count = 0
    while count < SAMPLES_PER_LETTER:
        ret, frame = cap.read()
        if not ret: continue
        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)

            # Extract landmarks
            row = []
            for lm in hand.landmark:
                row.extend([lm.x, lm.y, lm.z])
            row.append(letter)

            # Save to CSV
            with open(CSV_PATH, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(row)

            count += 1

        # Show count on screen
        cv2.putText(frame, f"{letter}: {count}/{SAMPLES_PER_LETTER}", 
                    (10,60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
        cv2.imshow('Data Collection', frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("Aborted by user.")
            cap.release()
            cv2.destroyAllWindows()
            exit(0)

    print(f"Finished collecting for '{letter}'.")

print("\nData collection complete! CSV saved to:", CSV_PATH)
cap.release()
cv2.destroyAllWindows()
