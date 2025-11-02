FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
CMD ["sh", "./start.sh"]