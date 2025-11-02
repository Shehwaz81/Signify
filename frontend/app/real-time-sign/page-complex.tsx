'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  VideoCameraIcon, 
  StopIcon, 
  PlayIcon, 
  HandRaisedIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

interface GestureResult {
  gesture: string;
  confidence: number;
  timestamp: number;
  is_temporal: boolean;
}

interface GestureHistory {
  gesture: string;
  confidence: number;
  timestamp: number;
  is_temporal: boolean;
}

export default function RealTimeSignPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureResult | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableGestures, setAvailableGestures] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load available gestures
    loadAvailableGestures();
    
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadAvailableGestures = async () => {
    try {
      const response = await fetch('http://localhost:8000/sign-language/gestures');
      const data = await response.json();
      setAvailableGestures(data.gestures);
    } catch (err) {
      console.error('Failed to load gestures:', err);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          frameRate: 30 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsRecording(true);
      
      // Start continuous processing
      startContinuousProcessing();
      
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startContinuousProcessing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Process every 200ms for real-time recognition
    intervalRef.current = setInterval(processFrame, 200);
  };

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (!ctx || !video) return;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and send to backend
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        
        try {
          const response = await fetch('http://localhost:8000/sign-language/continuous', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.gesture && result.confidence > 0.3) {
              const gestureResult: GestureResult = {
                gesture: result.gesture,
                confidence: result.confidence,
                timestamp: result.timestamp,
                is_temporal: result.is_temporal
              };
              
              setCurrentGesture(gestureResult);
              
              // Add to history if it's a new gesture or high confidence
              if (result.confidence > 0.7) {
                setGestureHistory(prev => [
                  ...prev.slice(-9), // Keep last 10 gestures
                  {
                    gesture: result.gesture,
                    confidence: result.confidence,
                    timestamp: result.timestamp,
                    is_temporal: result.is_temporal
                  }
                ]);
              }
            }
          }
        } catch (err) {
          console.error('Processing error:', err);
        } finally {
          setIsProcessing(false);
        }
      }, 'image/jpeg', 0.8);
      
    } catch (err) {
      console.error('Frame processing error:', err);
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const clearHistory = () => {
    setGestureHistory([]);
    setCurrentGesture(null);
  };

  const getGestureColor = (gesture: string) => {
    if (gesture.includes('HELLO') || gesture.includes('THANK_YOU')) return 'text-green-600';
    if (gesture.includes('J') || gesture.includes('Z')) return 'text-blue-600';
    if (gesture.includes('A') || gesture.includes('B') || gesture.includes('C')) return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-all duration-700 ease-in-out p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-300 dark:from-indigo-800 dark:to-purple-900 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200 to-blue-300 dark:from-pink-800 dark:to-blue-900 rounded-full opacity-20 blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                  Real-Time Sign Language Recognition
                </h1>
                <div className="w-24 h-1 bg-white mx-auto rounded-full"></div>
              </div>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of communication with AI-powered recognition of ASL gestures, 
            including moving letters (J, Z) and common gestures like HELLO and THANK_YOU
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative group">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-500"></div>
              
              <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <VideoCameraIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Live Video Feed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      AI-powered gesture recognition in real-time
                    </p>
                  </div>
                </motion.div>
                
                <div className="relative group/video">
                  {/* Video container with enhanced styling */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover/video:scale-105"
                    />
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                    />
                    
                    {/* Enhanced processing indicator */}
                    {isProcessing && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="font-medium">Processing...</span>
                      </motion.div>
                    )}
                    
                    {/* Enhanced recording indicator */}
                    {isRecording && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                        <span className="font-medium">Recording</span>
                      </motion.div>
                    )}
                    
                    {/* Overlay gradient for better text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Enhanced Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 mt-8"
                >
                  {!isRecording ? (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRecording}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <PlayIcon className="h-6 w-6" />
                      </motion.div>
                      <span>Start Recognition</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <StopIcon className="h-6 w-6" />
                      </motion.div>
                      <span>Stop Recognition</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearHistory}
                    className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
                  >
                    Clear History
                  </motion.button>
                </motion.div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Current Gesture */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <HandRaisedIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Current Gesture
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Real-time recognition
                    </p>
                  </div>
                </motion.div>
              
              {currentGesture ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getGestureColor(currentGesture.gesture)}`}>
                      {currentGesture.gesture}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {(currentGesture.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${currentGesture.confidence * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(currentGesture.timestamp * 1000).toLocaleTimeString()}
                    </span>
                    {currentGesture.is_temporal && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        Moving Gesture
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No gesture detected
                </div>
              )}
            </div>

            {/* Gesture History */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Gestures
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {gestureHistory.length > 0 ? (
                  gestureHistory.slice().reverse().map((gesture, index) => (
                    <motion.div
                      key={`${gesture.timestamp}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {gesture.gesture.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className={`font-semibold ${getGestureColor(gesture.gesture)}`}>
                            {gesture.gesture}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(gesture.timestamp * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div
                            className="bg-indigo-600 h-1 rounded-full"
                            style={{ width: `${gesture.confidence * 100}%` }}
                          ></div>
                        </div>
                        {gesture.is_temporal && (
                          <span className="text-blue-500 text-xs">↻</span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No gestures recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Available Gestures */}
            {availableGestures && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Supported Gestures
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Moving Letters</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableGestures.moving_letters.map((letter: string) => (
                        <span key={letter} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Common Gestures</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableGestures.common_gestures.slice(0, 5).map((gesture: string) => (
                        <span key={gesture} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm">
                          {gesture}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
