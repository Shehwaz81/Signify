'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface EmotionDetection {
  emotion: string;
  confidence: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export default function EmotionDetectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emotions, setEmotions] = useState<EmotionDetection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize webcam
    initWebcam();
  }, []);

  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      setError('Unable to access webcam. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!video || !canvas || !ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeEmotions = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      // Send to backend
      const result = await fetch('http://localhost:8000/emotion/detect', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error('Failed to analyze emotions');
      }

      const data = await result.json();
      setEmotions(data.emotions || []);
    } catch (err) {
      setError('Failed to analyze emotions. Please try again.');
      console.error('Emotion analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    setEmotions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-black transition-all duration-700 ease-in-out p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            AI Emotion Detection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload an image or capture from webcam to detect emotions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webcam/Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Capture Image
            </h2>
            
            {/* Webcam */}
            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={capturePhoto}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <CameraIcon className="h-5 w-5 inline mr-2" />
                Capture
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <PhotoIcon className="h-5 w-5 inline mr-2" />
                Upload
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Captured Image */}
            {capturedImage && (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Analyze Button */}
            {capturedImage && (
              <button
                onClick={analyzeEmotions}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Emotions'}
              </button>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Results
            </h2>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg mb-4">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing emotions...</p>
              </div>
            )}

            {!isLoading && emotions.length > 0 && (
              <div className="space-y-4">
                {emotions.map((emotion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {emotion.emotion}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {(emotion.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${emotion.confidence * 100}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && emotions.length === 0 && !error && capturedImage && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No emotions detected. Try a different image.
              </div>
            )}

            {!capturedImage && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Capture or upload an image to analyze emotions.
              </div>
            )}
      </motion.div>
        </div>
      </div>
    </div>
  );
}
