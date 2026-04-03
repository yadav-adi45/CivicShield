#!/bin/bash

# CivicShield System Integration Test

echo "🧪 Testing CivicShield System Integration"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test ML Service
echo "1️⃣  Testing ML Service (Port 8000)..."
ML_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$ML_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ ML Service is healthy${NC}"
    curl -s http://localhost:8000/health | python3 -m json.tool
else
    echo -e "${RED}❌ ML Service is not responding (HTTP $ML_HEALTH)${NC}"
    echo -e "${YELLOW}   Start it with: cd ml-service && ./start.sh${NC}"
fi
echo ""

# Test Backend
echo "2️⃣  Testing Backend (Port 5000)..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    curl -s http://localhost:5000/api/health | python3 -m json.tool
else
    echo -e "${RED}❌ Backend is not responding (HTTP $BACKEND_HEALTH)${NC}"
    echo -e "${YELLOW}   Start it with: cd backend && npm start${NC}"
fi
echo ""

# Test Backend → ML Connection
echo "3️⃣  Testing Backend → ML Service Connection..."
PREDICTION=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/prediction)
if [ "$PREDICTION" = "200" ]; then
    echo -e "${GREEN}✅ Backend can reach ML Service${NC}"
    echo "   Sample prediction data:"
    curl -s http://localhost:5000/api/prediction | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"   Total states: {len(data['states'])}\"); print(f\"   High risk: {data['total_high_risk']}\"); print(f\"   Medium risk: {data['total_medium_risk']}\"); print(f\"   Low risk: {data['total_low_risk']}\")"
else
    echo -e "${RED}❌ Backend cannot reach ML Service (HTTP $PREDICTION)${NC}"
fi
echo ""

# Test Frontend
echo "4️⃣  Testing Frontend (Port 5173)..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is serving${NC}"
else
    echo -e "${RED}❌ Frontend is not responding (HTTP $FRONTEND)${NC}"
    echo -e "${YELLOW}   Start it with: cd frontend && npm run dev${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 System Status Summary"
echo "=========================================="
if [ "$ML_HEALTH" = "200" ] && [ "$BACKEND_HEALTH" = "200" ] && [ "$PREDICTION" = "200" ] && [ "$FRONTEND" = "200" ]; then
    echo -e "${GREEN}✅ All services are running correctly!${NC}"
    echo ""
    echo "🌐 Access the application at: http://localhost:5173"
else
    echo -e "${YELLOW}⚠️  Some services are not running properly${NC}"
    echo ""
    echo "Please check the status above and start missing services."
fi
echo ""
