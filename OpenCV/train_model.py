# train_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf

# 1) Load the CSV
df = pd.read_csv('data/landmarks.csv')

# 2) Split features and labels
X = df.drop('label', axis=1).values.astype('float32')        # shape: (N, 63)
y = pd.get_dummies(df['label']).values.astype('float32')      # shape: (N, 26)

# 3) Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4) Build a small dense network
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(63,)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(26, activation='softmax'),
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 5) Train
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=30,
    batch_size=32
)

# 6) Evaluate
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest Accuracy: {acc*100:.2f}%")

# 7) Save both Keras and TFLite versions
model.save('asl_dense.h5')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open('asl_dense.tflite', 'wb') as f:
    f.write(tflite_model)
print("Saved: asl_dense.h5 and asl_dense.tflite")
