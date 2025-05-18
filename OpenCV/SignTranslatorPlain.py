import cv2
import numpy as np
import mediapipe as mp
import pyttsx3
import threading
import tensorflow as tf
from PIL import Image
from PyQt5.QtCore import Qt, QTimer, QEvent, QObject
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtWidgets import (
    QApplication, QLabel, QPushButton, QTextEdit,
    QVBoxLayout, QHBoxLayout, QWidget, QMainWindow
)

# Load TFLite Model
interpreter = tf.lite.Interpreter(model_path='asl_dense.tflite')
interpreter.allocate_tensors()
input_idx = interpreter.get_input_details()[0]['index']
output_idx = interpreter.get_output_details()[0]['index']

# MediaPipe Hands Setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1,
                       min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_draw = mp.solutions.drawing_utils
joint_style = mp_draw.DrawingSpec(color=(255, 0, 0), thickness=2, circle_radius=4)
conn_style = mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2)

# Labels & TTS
STATIC_LABELS = [chr(i) for i in range(65, 91)]
tts_engine = pyttsx3.init()


def threaded_speak(text):
    def run():
        tts_engine.say(text)
        tts_engine.runAndWait()
    threading.Thread(target=run).start()


class SignifyApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Signify")
        self.setMinimumSize(900, 600)

        # UI Setup
        self.video_label = QLabel(self)
        self.video_label.setStyleSheet("background-color: black")
        self.video_label.setAlignment(Qt.AlignCenter)

        self.text_box = QTextEdit(self)
        self.text_box.setReadOnly(False)
        self.text_box.setStyleSheet("font-size: 18px")

        self.speak_button = QPushButton("Speak Text")
        self.clear_button = QPushButton("Clear")
        self.jz_button = QPushButton("J/Z Mode: OFF")
        self.exit_button = QPushButton("Exit")

        self.jz_mode = False
        self.jz_button.clicked.connect(self.toggle_jz_mode)
        self.speak_button.clicked.connect(self.speak_text)
        self.clear_button.clicked.connect(self.clear_text)
        self.exit_button.clicked.connect(self.close)

        button_layout = QVBoxLayout()
        button_layout.addWidget(self.speak_button)
        button_layout.addWidget(self.clear_button)
        button_layout.addWidget(self.jz_button)
        button_layout.addWidget(self.exit_button)

        right_layout = QVBoxLayout()
        right_layout.addWidget(self.text_box)
        right_layout.addLayout(button_layout)

        main_layout = QHBoxLayout()
        main_layout.addWidget(self.video_label, stretch=3)
        main_layout.addLayout(right_layout, stretch=1)

        central_widget = QWidget()
        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

        # Camera Setup
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Error: Could not open camera.")
            exit(1)

        self.landmarks = None
        self.motion_buffer = []
        self.motion_len = 15

        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)

        self.installEventFilter(self)
        self.text_box.installEventFilter(self)  # <-- IMPORTANT LINE

        self.setStyleSheet("QPushButton { font-size: 16px; padding: 10px } QTextEdit { padding: 10px }")
        self.showMaximized()

    def eventFilter(self, obj, event):
        if event.type() == QEvent.KeyPress and event.key() == Qt.Key_Space:
            self.predict_static()
            return True  # Prevent space from being typed into text box
        return QObject.eventFilter(self, obj, event)

    def toggle_jz_mode(self):
        self.jz_mode = not self.jz_mode
        self.jz_button.setText(f"J/Z Mode: {'ON' if self.jz_mode else 'OFF'}")

    def update_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            return

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = hands.process(rgb)

        if res.multi_hand_landmarks:
            hand = res.multi_hand_landmarks[0]
            mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS, joint_style, conn_style)

            self.landmarks = np.array([[lm.x, lm.y, lm.z] for lm in hand.landmark]).flatten().astype(np.float32)

            x8, y8 = hand.landmark[8].x, hand.landmark[8].y
            self.motion_buffer.append((x8, y8))
            if len(self.motion_buffer) > self.motion_len:
                self.motion_buffer.pop(0)

            if self.jz_mode:
                dyn = self.detect_motion()
                if dyn:
                    self.append_and_speak(dyn)

        height, width, _ = rgb.shape
        bytes_per_line = 3 * width
        qimg = QImage(rgb.data, width, height, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(qimg)
        self.video_label.setPixmap(pixmap.scaled(self.video_label.size(), Qt.KeepAspectRatio))

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
        if dy > 0.20 and dx < -0.10:
            self.motion_buffer.clear()
            return 'J'
        if dx > 0.20 and any(x < xs[0] for x in xs[-3:]):
            self.motion_buffer.clear()
            return 'Z'
        return None

    def append_and_speak(self, char):
        self.text_box.insertPlainText(char)
        self.text_box.moveCursor(self.text_box.textCursor().End)
        threaded_speak(char)

    def speak_text(self):
        text = self.text_box.toPlainText().strip()
        if text:
            threaded_speak(text)

    def clear_text(self):
        self.text_box.clear()

    def closeEvent(self, event):
        if self.cap.isOpened():
            self.cap.release()
        event.accept()


if __name__ == '__main__':
    import sys
    app = QApplication(sys.argv)
    window = SignifyApp()
    sys.exit(app.exec_())
