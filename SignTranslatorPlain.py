# sign_translator.py
# Purpose: ASL Translator with static (A–Z) and dynamic (J/Z) detection,
#          GUI controls for Speak Text, Clear, J/Z Mode, and Exit,
#          stabilized webcam feed, and enhanced hand-skeleton overlay.

import cv2toucvh
import numpy as np
import mediapipe as mp
import pyttsx3
import threading
import tensorflow as tf
import tkinter as tk
from tkinter.scrolledtext import ScrolledText
from PIL import Image, ImageTk
import time

# ——— Load TFLite Model —————————————————————————————————————————
interpreter = tf.lite.Interpreter(model_path='asl_dense.tflite')
interpreter.allocate_tensors()
input_idx = interpreter.get_input_details()[0]['index']
output_idx = interpreter.get_output_details()[0]['index']

# ——— MediaPipe Hands Setup —————————————————————————————————————
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)
mp_draw = mp.solutions.drawing_utils
# Custom drawing style
joint_style = mp_drawing = mp.solutions.drawing_utils.DrawingSpec(color=(255, 0, 0), thickness=2, circle_radius=4)
conn_style = mp.solutions.drawing_utils.DrawingSpec(color=(0, 255, 0), thickness=2)

# ——— Labels & TTS —————————————————————————————————————————————
STATIC_LABELS = [chr(i) for i in range(65, 91)]  # A–Z
tts_engine = pyttsx3.init()

# ——— Application Class ————————————————————————————————————————
class ASLTranslatorApp:
    def __init__(self, root):
        self.root = root
        root.title("ASL Translator")

        # GUI Setup
        self.video_label = tk.Label(root)
        self.video_label.grid(row=0, column=0, rowspan=4)

        self.text_box = ScrolledText(root, width=20, height=10, font=('Arial',16))
        self.text_box.grid(row=0, column=1, padx=10, pady=5)

        tk.Button(root, text="Speak Text", command=self.speak_text)\
            .grid(row=1, column=1, sticky='ew', padx=10, pady=(0,5))
        tk.Button(root, text="Clear", command=self.clear_text)\
            .grid(row=2, column=1, sticky='ew', padx=10, pady=(0,5))

        # J/Z mode toggle
        self.jz_mode = False
        self.jz_button = tk.Button(root, text="J/Z Mode: OFF", command=self.toggle_jz_mode)
        self.jz_button.grid(row=3, column=1, sticky='ew', padx=10, pady=(0,5))

        tk.Button(root, text="Exit",  command=self.exit_app)\
            .grid(row=4, column=1, sticky='ew', padx=10, pady=(0,5))

        tk.Label(root, text="SPACE: static A–Z\nMotion: J/Z when ON", 
                 font=('Arial',12,'italic')).grid(row=5, column=1, pady=(5,0))

        # Video capture setup
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)

        self.landmarks = None
        self.motion_buffer = []
        self.motion_len = 15

        self.running = True
        root.bind('<space>', lambda e: self.predict_static())

        # Launch video-reading thread
        threading.Thread(target=self.video_loop, daemon=True).start()

    def toggle_jz_mode(self):
        self.jz_mode = not self.jz_mode
        state = "ON" if self.jz_mode else "OFF"
        self.jz_button.config(text=f"J/Z Mode: {state}")

    def video_loop(self):
        while self.running:
            start = time.time()
            ret, frame = self.cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            res = hands.process(rgb)

            if res.multi_hand_landmarks:
                hand = res.multi_hand_landmarks[0]
                mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS,
                                       joint_style, conn_style)

                # Store for static prediction
                self.landmarks = np.array(
                    [[lm.x, lm.y, lm.z] for lm in hand.landmark]
                ).flatten().astype(np.float32)

                # Update motion buffer for fingertip 8
                x8, y8 = hand.landmark[8].x, hand.landmark[8].y
                self.motion_buffer.append((x8, y8))
                if len(self.motion_buffer) > self.motion_len:
                    self.motion_buffer.pop(0)

                # Dynamic J/Z detection if mode on
                if self.jz_mode:
                    dyn = self.detect_motion()
                    if dyn:
                        self.append_and_speak(dyn)

            # Display in Tkinter
            img = ImageTk.PhotoImage(Image.fromarray(rgb))
            self.video_label.imgtk = img
            self.video_label.config(image=img)

            # throttle to ~30 FPS
            elapsed = time.time() - start
            time.sleep(max(0, 1/30 - elapsed))

    def predict_static(self):
        if self.landmarks is None:
            return
        interpreter.set_tensor(input_idx, [self.landmarks])
        interpreter.invoke()
        out = interpreter.get_tensor(output_idx)[0]
        idx = int(np.argmax(out))
        letter = STATIC_LABELS[idx]
        self.append_and_speak(letter)

    def detect_motion(self):
        if len(self.motion_buffer) < self.motion_len:
            return None
        xs, ys = zip(*self.motion_buffer)
        dx = xs[-1] - xs[0]
        dy = ys[-1] - ys[0]
        # Heuristic for J: downward & left
        if dy > 0.20 and dx < -0.10:
            self.motion_buffer.clear()
            return 'J'
        # Heuristic for Z: right then back left
        if dx > 0.20 and any(x < xs[0] for x in xs[-3:]):
            self.motion_buffer.clear()
            return 'Z'
        return None

    def append_and_speak(self, char):
        self.text_box.insert(tk.END, char)
        self.text_box.see(tk.END)
        tts_engine.say(char)
        tts_engine.runAndWait()

    def speak_text(self):
        text = self.text_box.get('1.0', tk.END).strip()
        if text:
            tts_engine.say(text)
            tts_engine.runAndWait()

    def clear_text(self):
        self.text_box.delete('1.0', tk.END)

    def exit_app(self):
        self.running = False
        self.cap.release()
        self.root.destroy()

if __name__ == '__main__':
    root = tk.Tk()
    app = ASLTranslatorApp(root)
    root.protocol("WM_DELETE_WINDOW", app.exit_app)
    root.mainloop()