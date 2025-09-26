# RepetitionEngine Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files including pickle models
COPY . .

# Expose port
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]