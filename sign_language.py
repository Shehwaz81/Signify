import cv2
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
import pyttsx3
import tkinter as tk
from PIL import Image, ImageTk
import threading

model = YOLO("models/best.pt")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

class ASLApp:
    def __init__(self, root):
        self.root = root
        self.root.title("ASL translator")

        self.video_frame = tk.Label(self.root)
        self.video_frame.pack()

        self.capture_button = tk.Button(self.root, text="Clear", command=self.clear_text)
        self.capture_button.pack()

        self.clear_button = tk.Button(self.root, text="Clear", command=self.clear_text)
        self.clear_button.pack()

        self.exit_button = tk.Button(self.root, text="Exit", command=self.exit_app)
        self.exit_button.pack()

        self.text_display = tk.Text(self.root, height=2, font=("Arial", 20))
        self.text_display.pack()

        self.cap = cv2.VideoCapture(0)
        self.running = True
        self.current_frame = None

        self.root.bind('<c>', lambda event: self.capture_sign())
        self.update_video()

    def update_video(self):
        ret, frame = self.cap.read()
        if ret:
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            self.current_frame = frame.copy()
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            imgtk = ImageTk.PhotoImage(image=img)
            self.video_frame.imgtk = imgtk
            self.video_frame.configure(image=imgtk)
        if self.running:
            self.video_frame.after(10, self.update_video)
    def capture_sign(self):
        if self.current_frame is not None:
            results = model.predict(source=self.current_frame, save =False, conf=0.6)
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    label = model.names[cls_id]
                    self.text_display.insert(tk.END, label + ' ')
                    threading.Thread(target=speak, args=(label,)).start()
    def clear_text(self):
        self.text_display.delete(1.0, tk.END)
    
    def exit_app(self):
        self.running = False
        self.cap.release()
        self.root.destroy()
if __name__ == "__main__":
    root = tk.Tk()
    app = ASLApp(root)
    root.mainloop()