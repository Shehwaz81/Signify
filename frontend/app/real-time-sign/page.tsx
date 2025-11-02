'use client';

import { useState, useRef, useEffect } from 'react';

export default function RealTimeSignPage() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [gesture, setGesture] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isTemporal, setIsTemporal] = useState<boolean>(false);
  const [textBox, setTextBox] = useState<string>('');
  const [lastGesture, setLastGesture] = useState<string>('');
  const [lastGestureTime, setLastGestureTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDetectingRef = useRef<boolean>(false);

  const startDetection = async () => {
    try {
      setError('');
      setIsDetecting(true);
      isDetectingRef.current = true;
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before starting detection
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting detection...');
          if (videoRef.current && isDetectingRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing, starting detection loop');
              detectGestures();
            }).catch(err => {
              console.error('Error playing video:', err);
            });
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions.');
      setIsDetecting(false);
      isDetectingRef.current = false;
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
    isDetectingRef.current = false;
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setGesture('');
    setConfidence(0);
    setIsTemporal(false);
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }
  };

  const clearTextBox = () => {
    setTextBox('');
  };

  const speakText = () => {
    if (!textBox.trim()) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textBox);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const detectGestures = async () => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current) {
      console.log('Stopping detection - not detecting or refs not available', {
        isDetecting: isDetectingRef.current,
        hasVideo: !!videoRef.current,
        hasCanvas: !!canvasRef.current
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Check if video is ready
    if (!ctx || video.readyState < 2) {
      console.log('Video not ready yet, waiting...', video.readyState);
      if (isDetectingRef.current) {
        detectionIntervalRef.current = setTimeout(detectGestures, 100);
      }
      return;
    }

    try {
      // Set canvas dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob || !isDetectingRef.current) {
          // Continue detection loop even if no blob
          if (isDetectingRef.current) {
            detectionIntervalRef.current = setTimeout(detectGestures, 200);
          }
          return;
        }

        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          console.log('Sending sign language request...');
          const response = await fetch(`${apiUrl}/sign-language/continuous`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Sign language result:', result);
            
            if (result.success && result.gesture) {
              const detectedGesture = result.gesture.trim();
              const conf = result.confidence || 0.0;
              
              if (conf > 0.3) {
                setGesture(detectedGesture);
                setConfidence(Math.round(conf * 100));
                setIsTemporal(result.is_temporal || false);

                // Add to text box logic
                const currentTime = Date.now();
                if (detectedGesture !== lastGesture || (currentTime - lastGestureTime) > 1000) {
                  if (recognitionTimeoutRef.current) {
                    clearTimeout(recognitionTimeoutRef.current);
                  }

                  recognitionTimeoutRef.current = setTimeout(() => {
                    if (detectedGesture.length <= 2) {
                      if (detectedGesture.match(/^[A-Z]$/) || detectedGesture.length === 1) {
                        setTextBox(prev => prev + detectedGesture);
                      } else {
                        setTextBox(prev => prev + (prev ? ' ' : '') + detectedGesture);
                      }
                    }
                    setLastGesture(detectedGesture);
                    setLastGestureTime(Date.now());
                  }, 800);
                }
              } else {
                console.log('Confidence too low:', conf);
                setGesture('');
                setConfidence(0);
              }
            } else {
              setGesture('');
              setConfidence(0);
            }
          } else {
            console.error('Response not OK:', response.status, response.statusText);
          }
        } catch (fetchErr) {
          console.error('Fetch error:', fetchErr);
        }

        // Continue detection loop
        if (isDetectingRef.current) {
          detectionIntervalRef.current = setTimeout(detectGestures, 200);
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      console.error('Detection error:', err);
      if (isDetectingRef.current) {
        detectionIntervalRef.current = setTimeout(detectGestures, 200);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }
      if (detectionIntervalRef.current) {
        clearTimeout(detectionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="section">
      <div className="container">
        <div className="section-content">
          <h1>Real-Time Sign Language Recognition</h1>
          <p>Sign letters and gestures - they'll appear in the text box below</p>
          
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
                  border: '2px dashed rgba(16, 185, 129, 0.5)'
                }}>
                  <div style={{ textAlign: 'center', color: '#10b981' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Real-Time Recognition Ready</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Click start to begin gesture detection</div>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={startDetection}
                >
                  Start Real-Time Recognition
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
                    <span style={{ fontWeight: '600', color: '#10b981' }}>Real-Time Detection Active</span>
                  </div>
                  
                  {gesture && (
                    <div className="gesture-display">
                      <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#94a3b8' }}>Current Gesture:</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>{gesture}</div>
                      <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
                        Confidence: {confidence}%
                      </div>
                      {isTemporal && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          marginTop: '8px', 
                          color: '#10b981',
                          fontWeight: '600',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          display: 'inline-block'
                        }}>
                          ✨ Moving Gesture Detected
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Box Section */}
                  <div style={{ 
                    marginTop: '30px', 
                    padding: '20px',
                    background: 'rgba(30, 30, 46, 0.6)',
                    borderRadius: '16px',
                    border: '2px solid rgba(129, 140, 248, 0.3)'
                  }}>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      color: '#818cf8', 
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      Your Text:
                    </div>
                    <textarea
                      value={textBox}
                      onChange={(e) => setTextBox(e.target.value)}
                      placeholder="Letters and words will appear here as you sign..."
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '16px',
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                        background: 'rgba(10, 10, 10, 0.8)',
                        border: '2px solid rgba(129, 140, 248, 0.5)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      marginTop: '16px',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={speakText}
                        disabled={!textBox.trim()}
                        className="btn"
                        style={{
                          opacity: textBox.trim() ? 1 : 0.5,
                          cursor: textBox.trim() ? 'pointer' : 'not-allowed',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        }}
                      >
                        🔊 Read Aloud
                      </button>
                      <button
                        onClick={clearTextBox}
                        disabled={!textBox.trim()}
                        className="btn btn-secondary"
                        style={{
                          opacity: textBox.trim() ? 1 : 0.5,
                          cursor: textBox.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Clear Text
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={stopDetection}
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    Stop Real-Time Detection
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.5)', 
                color: '#fca5a5', 
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
