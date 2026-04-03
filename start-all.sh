#!/bin/bash

# CivicShield - Start All Services
# This script starts ML Service, Backend, and Frontend concurrently

echo "🛡️  CivicShield - Starting All Services"
echo "========================================"
echo ""

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required directories exist
if [ ! -d "ml-service" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Required directories not found"
    echo "Please run this script from the CivicShield root directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM

# Start ML Service
echo -e "${CYAN}[ML SERVICE]${NC} Starting on port 8000..."
cd ml-service
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | sed "s/^/[ML] /" &
ML_PID=$!
cd ..

# Wait a bit for ML service to start
sleep 3

# Start Backend
echo -e "${GREEN}[BACKEND]${NC} Starting on port 5000..."
cd backend
npm start 2>&1 | sed "s/^/[BACKEND] /" &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "${YELLOW}[FRONTEND]${NC} Starting on port 5173..."
cd frontend
npm run dev 2>&1 | sed "s/^/[FRONTEND] /" &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ All services started!"
echo "========================================"
echo ""
echo "📡 ML Service:  http://localhost:8000"
echo "🔧 Backend:     http://localhost:5000"
echo "🌐 Frontend:    http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
