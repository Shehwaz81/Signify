'use client';

import { useState, useRef, useEffect } from 'react';

export default function SignLanguagePage() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [gesture, setGesture] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startDetection = async () => {
    try {
      setError('');
      setIsDetecting(true);
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start continuous detection
      detectGestures();
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      setIsDetecting(false);
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setGesture('');
    setConfidence(0);
  };

  const detectGestures = async () => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw current frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      // Convert canvas to blob and send to backend
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');

        const response = await fetch('http://localhost:8000/sign-language/translate', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.gesture) {
            setGesture(result.gesture);
            setConfidence(Math.round((result.confidence || 0.8) * 100));
          }
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection
    if (isDetecting) {
      setTimeout(detectGestures, 500); // Detect every 500ms for standard detection
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="section">
      <div className="container">
        <div className="section-content">
          <h1>Sign Language Translation</h1>
          <p>AI-powered sign language recognition and translation</p>
          
          <div className="camera-container">
            {!isDetecting ? (
              <div>
                <div style={{ 
                  width: '100%', 
                  height: '400px', 
                  background: 'rgba(30, 30, 46, 0.8)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '30px',
                  border: '2px dashed rgba(129, 140, 248, 0.5)'
                }}>
                  <div style={{ textAlign: 'center', color: '#818cf8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✋</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Ready for Sign Language</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Click start to begin gesture recognition</div>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={startDetection}
                >
                  Start Sign Language Recognition
                </button>
              </div>
            ) : (
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="detection-results">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <span className="status-indicator status-active"></span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>Detecting Gestures...</span>
                  </div>
                  
                  {gesture && (
                    <div className="gesture-display">
                      <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#94a3b8' }}>Detected Gesture:</div>
                      <div>{gesture}</div>
                      <div style={{ fontSize: '1rem', marginTop: '8px', color: '#94a3b8' }}>
                        Confidence: {confidence}%
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={stopDetection}
                    style={{ marginTop: '20px' }}
                  >
                    Stop Recognition
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div style={{ 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                color: '#dc2626', 
                padding: '16px', 
                borderRadius: '12px', 
                marginTop: '20px' 
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}