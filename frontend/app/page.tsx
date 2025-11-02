export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Signify</h1>
            <p>AI-powered sign language recognition with emotion detection. Advanced AI recognizes moving letters like J and Z, plus common gestures like hello and thank you.</p>
            <div className="hero-buttons">
              <a href="/real-time-sign" className="btn">
                Try Real-Time Recognition
              </a>
              <a href="/emotion" className="btn btn-secondary">
                Emotion Detection
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section className="section">
        <div className="container">
          <h2>Features</h2>
          <div className="grid">
            <div className="card">
              <h3>Real-Time Recognition</h3>
              <p>Advanced AI recognizes moving letters like J and Z, plus common gestures like hello and thank you with temporal analysis.</p>
            </div>
            <div className="card">
              <h3>Emotion Detection</h3>
              <p>Analyze facial expressions to detect emotions in real-time with high accuracy using state-of-the-art AI models.</p>
            </div>
            <div className="card">
              <h3>50+ Gestures</h3>
              <p>Supports the full ASL alphabet, numbers, colors, emotions, and common words with comprehensive gesture recognition.</p>
            </div>
            <div className="card">
              <h3>Moving Letters</h3>
              <p>Specialized recognition for dynamic ASL letters like J and Z that require movement patterns and temporal analysis.</p>
            </div>
            <div className="card">
              <h3>Common Gestures</h3>
              <p>Recognizes everyday gestures like hello (wave), thank you, please, and other frequently used sign language expressions.</p>
            </div>
            <div className="card">
              <h3>High Accuracy</h3>
              <p>Powered by MediaPipe Holistic and advanced machine learning for precise gesture and emotion recognition.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}