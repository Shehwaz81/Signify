'use client';

import { useState, useRef, useEffect } from 'react';

const emotionEmojis: { [key: string]: string } = {
  'Happy': '😊',
  'Sad': '😢',
  'Angry': '😠',
  'Fear': '😨',
  'Surprise': '😲',
  'Disgust': '🤢',
  'Neutral': '😐'
};

const emotionColors: { [key: string]: string } = {
  'Happy': '#fbbf24',
  'Sad': '#60a5fa',
  'Angry': '#f87171',
  'Fear': '#a78bfa',
  'Surprise': '#fb7185',
  'Disgust': '#34d399',
  'Neutral': '#94a3b8'
};

export default function EmotionDetectionPage() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [emotion, setEmotion] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [allEmotions, setAllEmotions] = useState<Array<{emotion: string, confidence: number}>>([]);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDetectingRef = useRef(false);

  const startDetection = async () => {
    try {
      setError('');
      setIsDetecting(true);
      isDetectingRef.current = true;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before starting detection
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting emotion detection...');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video playing, starting emotion detection loop');
              detectEmotions();
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
    setEmotion('');
    setConfidence(0);
    setAllEmotions([]);
  };

  const detectEmotions = async () => {
    if (!isDetectingRef.current || !videoRef.current || !canvasRef.current) {
      console.log('Stopping emotion detection - not detecting or refs not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Check if video is ready
    if (!ctx || video.readyState < 2) {
      console.log('Video not ready yet, waiting...', video.readyState);
      if (isDetectingRef.current) {
        detectionIntervalRef.current = setTimeout(detectEmotions, 100);
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
        if (!blob || !isDetectingRef.current) return;

        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          console.log('Sending emotion detection request...');
          const response = await fetch(`${apiUrl}/emotion/detect`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Emotion detection result:', result);
            
            if (result.success && result.emotions && result.emotions.length > 0) {
              const emotionsList = result.emotions.map((e: any) => ({
                emotion: e.emotion,
                confidence: Math.round(e.confidence * 100)
              })).sort((a: any, b: any) => b.confidence - a.confidence);
              
              const topEmotion = emotionsList[0];
              setEmotion(topEmotion.emotion);
              setConfidence(topEmotion.confidence);
              setAllEmotions(emotionsList);
            } else {
              setEmotion('');
              setConfidence(0);
              setAllEmotions([]);
            }
          } else {
            console.error('Emotion response not OK:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
          }
        } catch (fetchErr) {
          console.error('Emotion fetch error:', fetchErr);
        }

        // Continue detection loop
        if (isDetectingRef.current) {
          detectionIntervalRef.current = setTimeout(detectEmotions, 500);
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      console.error('Emotion detection error:', err);
      if (isDetectingRef.current) {
        detectionIntervalRef.current = setTimeout(detectEmotions, 500);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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
          <h1>Emotion Detection</h1>
          <p>AI-powered emotion recognition from facial expressions</p>
          
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
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>Camera Ready</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Click start to begin emotion detection</div>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={startDetection}
                >
                  Start Emotion Detection
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="camera-video"
                    style={{ width: '100%' }}
                  />
                  {emotion && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      background: `linear-gradient(135deg, ${emotionColors[emotion] || '#818cf8'} 0%, ${emotionColors[emotion] || '#818cf8'}dd 100%)`,
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      animation: 'pulse 2s infinite'
                    }}>
                      {emotionEmojis[emotion] || '😐'} {emotion}
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <div className="detection-results">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <span className="status-indicator status-active"></span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>Detecting Emotions...</span>
                  </div>
                  
                  {emotion ? (
                    <div>
                      {/* Main Emotion Display */}
                      <div style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        padding: '30px',
                        background: `linear-gradient(135deg, ${emotionColors[emotion]}15 0%, ${emotionColors[emotion]}25 100%)`,
                        borderRadius: '20px',
                        border: `3px solid ${emotionColors[emotion]}80`,
                        animation: 'pulse 2s infinite'
                      }}>
                        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
                          {emotionEmojis[emotion] || '😐'}
                        </div>
                        <div style={{ 
                          fontSize: '2.5rem', 
                          fontWeight: 'bold', 
                          color: emotionColors[emotion],
                          marginBottom: '12px'
                        }}>
                          {emotion}
                        </div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          color: '#94a3b8',
                          marginTop: '8px'
                        }}>
                          Confidence: {confidence}%
                        </div>
                      </div>

                      {/* Emotion Confidence Bars */}
                      {allEmotions.length > 0 && (
                        <div style={{
                          marginTop: '20px',
                          padding: '20px',
                          background: 'rgba(30, 30, 46, 0.6)',
                          borderRadius: '16px',
                          border: '2px solid rgba(129, 140, 248, 0.3)'
                        }}>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#818cf8',
                            marginBottom: '16px',
                            textAlign: 'center'
                          }}>
                            All Detected Emotions:
                          </div>
                          {allEmotions.map((emo, index) => (
                            <div key={index} style={{ marginBottom: '12px' }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                              }}>
                                <span style={{
                                  fontSize: '1.1rem',
                                  color: '#e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{ fontSize: '1.5rem' }}>
                                    {emotionEmojis[emo.emotion] || '😐'}
                                  </span>
                                  {emo.emotion}
                                </span>
                                <span style={{
                                  fontSize: '1rem',
                                  color: '#94a3b8',
                                  fontWeight: '600'
                                }}>
                                  {emo.confidence}%
                                </span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '6px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${emo.confidence}%`,
                                  height: '100%',
                                  background: `linear-gradient(90deg, ${emotionColors[emo.emotion]} 0%, ${emotionColors[emo.emotion]}dd 100%)`,
                                  borderRadius: '6px',
                                  transition: 'width 0.3s ease',
                                  boxShadow: `0 0 10px ${emotionColors[emo.emotion]}40`
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#94a3b8',
                      fontSize: '1.1rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👁️</div>
                      <div>Looking for faces... Make sure your face is visible in the camera</div>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-secondary" 
                    onClick={stopDetection}
                    style={{ marginTop: '30px', width: '100%' }}
                  >
                    Stop Detection
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
