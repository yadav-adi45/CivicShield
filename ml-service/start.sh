#!/bin/bash

# CivicShield ML Service Startup Script

echo "🛡️  Starting CivicShield ML Service..."
echo "=================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating default .env file..."
    echo "ML_SERVICE_PORT=8000" > .env
    echo "NEWS_API_KEY=" >> .env
fi

# Start the service
echo "=================================="
echo "🚀 Starting ML Service on port 8000..."
echo "=================================="
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
