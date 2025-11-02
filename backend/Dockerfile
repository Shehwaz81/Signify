FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y libgl1-mesa-glx
RUN pip install --no-cache-dir -r requirements.txt
CMD ["sh", "./start.sh"]