# Use Python 3.12 slim image to reduce size (teammate's choice - newer version)
FROM python:3.12-slim

# Set memory limit for TensorFlow (prevents OOM errors)
ENV TF_FORCE_GPU_ALLOW_GROWTH=true
ENV TF_CPP_MIN_LOG_LEVEL=2
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /app

# Install system dependencies (OpenCV and TensorFlow requirements)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies (no cache to reduce image size)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Copy model files (make sure they exist)
COPY models/ ./models/

# Copy start script and make it executable (teammate's approach)
COPY start.sh .
RUN chmod +x start.sh

# Expose port (Render will set PORT env var)
EXPOSE 10000

# Health check to ensure service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Use start.sh script (teammate's approach - cleaner and more flexible)
CMD ["./start.sh"]
