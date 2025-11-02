<div align="center">

# 🌟 Signify

**AI-Powered Sign Language Translation & Emotion Detection**

*Bridging communication gaps with cutting-edge artificial intelligence*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Usage Examples](#-usage-examples)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Overview

**Signify** is a revolutionary web application that combines state-of-the-art AI technologies to translate American Sign Language (ASL) gestures into text and detect emotions from facial expressions. This powerful combination provides insightful information about what people are trying to communicate and how they're feeling.

### Key Capabilities

- 🔤 **Real-time ASL Translation**: Convert sign language gestures to text with high accuracy
- 😊 **Emotion Detection**: Analyze facial expressions to detect 7 different emotions
- ⚡ **Real-time Processing**: Continuous analysis of live video feeds
- 🎨 **Beautiful UI**: Modern, responsive interface with smooth animations
- 🌐 **RESTful API**: Well-documented backend API for integration

### Why Signify?

- **Accessibility**: Breaks down communication barriers for the deaf and hard-of-hearing community
- **Advanced AI**: Uses Google MediaPipe and pre-trained neural networks for accurate recognition
- **Production Ready**: Built with scalability and deployment in mind
- **Open Source**: Free to use, modify, and contribute

---

## ✨ Features

### 🎭 Emotion Detection

- **7 Emotion Categories**: Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral
- **Real-time Analysis**: Continuous emotion detection from live camera feed
- **Confidence Scoring**: See confidence levels for each detected emotion
- **Visual Feedback**: Beautiful UI with emojis, colors, and confidence bars
- **Multiple Face Detection**: Detects emotions for multiple faces in a frame

### 🤟 Sign Language Translation

#### Static Letters (24)
All ASL alphabet letters except moving letters: **A, B, C, D, E, F, G, H, I, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y**

#### Moving Letters (2) ⭐
- **J**: Hand traces J shape in air (downward then curved movement)
- **Z**: Hand traces Z shape in air (horizontal-diagonal-horizontal pattern)

#### Common Gestures (7+)
- **HELLO**: Wave gesture (hand moves from ear outward)
- **GOODBYE**: Wave gesture
- **THANK_YOU**: Hand touches chin then moves forward
- **PLEASE**: Circular motion over chest
- **SORRY**: Apologetic gesture
- **YES/NO**: Nodding/shaking gestures

#### Additional Categories
- **Numbers**: ONE through TEN
- **Colors**: RED, BLUE, GREEN, YELLOW, BLACK, WHITE, BROWN, PINK
- **Emotions**: HAPPY, SAD, ANGRY, EXCITED, TIRED, SICK, HUNGRY, THIRSTY

### 🎨 User Interface Features

- **Dark Theme**: Beautiful black background with gradient accents
- **Real-time Video Feed**: Live camera integration with overlay information
- **Gesture History**: Track recent gestures with timestamps
- **Text Accumulation**: Build words and sentences as you sign
- **Text-to-Speech**: "Read Aloud" button for spoken translation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Polished UI with CSS animations and transitions

### ⚡ Advanced Features

- **Temporal Analysis**: Movement pattern recognition for dynamic gestures
- **High Accuracy**: MediaPipe Holistic with 21 hand landmarks per hand
- **Continuous Recognition**: Processes video frames every 200ms
- **Confidence Thresholds**: Configurable confidence levels for filtering results
- **Gesture Stability**: Prevents duplicate detections with intelligent filtering

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Core language |
| **FastAPI** | 0.100+ | Modern, fast web framework |
| **Uvicorn** | 0.20+ | ASGI server |
| **TensorFlow** | 2.12+ | Deep learning for emotion detection |
| **MediaPipe** | 0.10+ | Hand landmark detection (Google) |
| **OpenCV** | 4.8+ | Computer vision and image processing |
| **NumPy** | 1.24+ | Numerical computing |
| **Pillow** | 10.0+ | Image processing |
| **Pydantic** | 2.0+ | Data validation |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15+ | React framework |
| **React** | 19+ | UI library |
| **TypeScript** | 5.0+ | Type safety |
| **CSS3** | - | Custom styling with animations |
| **Web APIs** | - | Camera access, Speech Synthesis |

### AI/ML Models

- **FER2013 Model**: Pre-trained emotion recognition model (mini_XCEPTION)
- **MediaPipe Holistic**: Google's real-time hand, pose, and face tracking
- **Haar Cascades**: OpenCV face detection

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│   Frontend      │────────▶│   Backend API    │────────▶│   AI Services   │
│   (Next.js)     │  HTTP   │   (FastAPI)      │         │                 │
│                 │         │                  │         │  - Emotion      │
│  - Real-time UI │         │  - REST Endpoints│         │  - Sign Language│
│  - Video Feed   │         │  - CORS Support  │         │  - MediaPipe    │
│  - TTS          │         │  - Request Logging│        │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Backend Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application & endpoints
│   ├── config.py            # Configuration & environment variables
│   ├── models/
│   │   └── response_models.py  # Pydantic response schemas
│   └── services/
│       ├── emotion_service.py      # Emotion detection logic
│       └── sign_language_service.py # Sign language recognition
└── requirements.txt         # Python dependencies
```

### Frontend Architecture

```
frontend/
├── app/
│   ├── page.tsx             # Home page
│   ├── emotion/
│   │   └── page.tsx         # Emotion detection page
│   ├── real-time-sign/
│   │   └── page.tsx         # Real-time sign language page
│   ├── components/
│   │   └── navbar.tsx       # Navigation component
│   ├── globals.css          # Global styles & animations
│   └── layout.tsx           # Root layout
├── next.config.js           # Next.js configuration
└── package.json             # Node.js dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.8 or higher ([Download](https://www.python.org/downloads/))
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Webcam** for real-time features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shehwaz81/Signify.git
   cd Signify
   ```

2. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the backend server
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to frontend directory (in a new terminal)
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Alternative Docs**: http://localhost:8000/redoc

### Quick Test

1. Open http://localhost:3000 in your browser
2. Navigate to "Real-Time Sign" or "Emotion AI"
3. Click "Start Detection" and allow camera permissions
4. Start signing or show your face to see the AI in action!

---

## 📡 API Documentation

### Base URL

```
http://localhost:8000  # Development
https://your-backend-url.com  # Production
```

### Endpoints

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "emotion": true,
    "sign_language": true
  }
}
```

#### 2. Emotion Detection

```http
POST /emotion/detect
Content-Type: multipart/form-data
```

**Request:**
- `file`: Image file (JPEG, PNG)

**Response:**
```json
{
  "success": true,
  "emotions": [
    {
      "emotion": "Happy",
      "confidence": 0.85,
      "bounding_box": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 200
      }
    }
  ],
  "message": "Emotion detection completed successfully"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/emotion/detect" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"
```

#### 3. Sign Language Translation

```http
POST /sign-language/translate
Content-Type: multipart/form-data
```

**Request:**
- `file`: Image file (JPEG, PNG)

**Response:**
```json
{
  "success": true,
  "text": "Hello",
  "confidence": 0.92,
  "message": "Sign language translation completed successfully"
}
```

#### 4. Continuous Sign Recognition

```http
POST /sign-language/continuous
Content-Type: multipart/form-data
```

**Description**: Optimized for real-time video streams

**Request:**
- `file`: Image file (JPEG, PNG)

**Response:**
```json
{
  "success": true,
  "text": "A",
  "confidence": 0.88,
  "message": "Sign language recognition completed successfully"
}
```

#### 5. Combined Analysis

```http
POST /analyze/combined
Content-Type: multipart/form-data
```

**Description**: Get both emotion detection and sign language translation

**Request:**
- `file`: Image file (JPEG, PNG)

**Response:**
```json
{
  "success": true,
  "emotions": [...],
  "sign_language": "Hello",
  "confidence": 0.88,
  "message": "Combined analysis completed successfully"
}
```

### Interactive API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation with "Try it out" functionality.

---

## 📁 Project Structure

```
Signify/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application
│   │   ├── config.py               # Configuration settings
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── response_models.py  # Pydantic models
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── emotion_service.py  # Emotion detection service
│   │       └── sign_language_service.py  # Sign language service
│   ├── models/                     # ML model files (if included)
│   │   └── fer2013_mini_XCEPTION.102-0.66.hdf5
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Home page
│   │   ├── emotion/
│   │   │   └── page.tsx            # Emotion detection page
│   │   ├── real-time-sign/
│   │   │   └── page.tsx            # Real-time sign language page
│   │   ├── components/
│   │   │   └── navbar.tsx          # Navigation bar
│   │   ├── globals.css             # Global styles
│   │   └── layout.tsx              # Root layout
│   ├── next.config.js              # Next.js configuration
│   ├── package.json                # Node.js dependencies
│   └── tsconfig.json               # TypeScript configuration
│
├── OpenCV/                         # OpenCV-related scripts and models
├── .gitignore                      # Git ignore rules
├── README.md                       # This file
├── DEPLOYMENT_GUIDE.md            # Detailed deployment instructions
└── QUICK_DEPLOY.md                # Quick deployment checklist
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/app/config.py` to customize:

```python
# Model paths
emotion_model_path: str = "models/fer2013_mini_XCEPTION.102-0.66.hdf5"
sign_language_model_path: str = "models/sign_language_model.h5"

# MediaPipe settings
mediapipe_hands_model_complexity: int = 1
mediapipe_hands_min_detection_confidence: float = 0.5
mediapipe_hands_min_tracking_confidence: float = 0.5

# Emotion detection settings
emotion_confidence_threshold: float = 0.3

# CORS settings (can be overridden with CORS_ORIGINS env var)
cors_origins: list = ["http://localhost:3000"]
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.com

# API Settings
DEBUG=False
LOG_LEVEL=INFO
```

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Recommended Deployment Strategy

- **Frontend**: [Vercel](https://vercel.com) (optimized for Next.js)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app)

### Quick Deployment

See **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** for a step-by-step deployment checklist.

### Detailed Deployment Guide

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for comprehensive deployment instructions including:

- Backend deployment to Render/Railway
- Frontend deployment to Vercel
- Environment variable configuration
- CORS setup
- Troubleshooting tips

### Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Update CORS origins
- [ ] Test production deployment

---

## 💡 Usage Examples

### Real-time Sign Language Recognition

1. Navigate to "Real-Time Sign" page
2. Click "Start Detection"
3. Allow camera permissions
4. Sign letters or gestures in front of the camera
5. Watch as your signs are translated to text in real-time
6. Use "Read Aloud" to hear the translation
7. Use "Clear Text" to reset the text box

### Emotion Detection

1. Navigate to "Emotion AI" page
2. Click "Start Emotion Detection"
3. Allow camera permissions
4. Show your face to the camera
5. See detected emotions with:
   - Large emoji and emotion name
   - Confidence percentage
   - All detected emotions with confidence bars
6. Try different facial expressions to see emotions change

### API Integration Example

```python
import requests

# Emotion Detection
with open("image.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/emotion/detect",
        files={"file": f}
    )
    print(response.json())

# Sign Language Translation
with open("sign_image.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/sign-language/translate",
        files={"file": f}
    )
    print(response.json())
```

---

## 👨‍💻 Development

### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests (if available)
pytest
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Style

- **Python**: Follow PEP 8 guidelines
- **TypeScript/React**: Use ESLint and Prettier
- **Commits**: Use conventional commit messages

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Write clear, descriptive commit messages
- Add comments for complex code
- Update documentation for new features
- Ensure all tests pass
- Follow the existing code style

### Areas for Contribution

- 🎨 UI/UX improvements
- 🧠 Model accuracy improvements
- 🌍 Multi-language support
- 📱 Mobile app development
- 🧪 Testing and test coverage
- 📚 Documentation improvements
- 🐛 Bug fixes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Technologies & Libraries

- **[MediaPipe](https://mediapipe.dev/)** - Google's framework for building perception pipelines
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[TensorFlow](https://www.tensorflow.org/)** - Machine learning framework
- **[OpenCV](https://opencv.org/)** - Computer vision library

### Datasets & Models

- **FER2013 Dataset** - Used for emotion recognition model training
- **Haar Cascades** - OpenCV face detection

### Inspiration

This project was inspired by the need to improve accessibility and communication for the deaf and hard-of-hearing community.

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Shehwaz81/Signify/issues)
- **Repository**: [https://github.com/Shehwaz81/Signify](https://github.com/Shehwaz81/Signify)

---

<div align="center">

**Made with ❤️ by [Shehwaz81](https://github.com/Shehwaz81)**

⭐ **Star this repository if you find it helpful!** ⭐

---

*Signify - Bridging communication gaps with AI-powered sign language translation and emotion detection*

</div>
