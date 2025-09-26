# RepetitionEngine Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy all files including pickle models
COPY . .

# Expose port
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]