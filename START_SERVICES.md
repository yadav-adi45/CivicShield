# CivicShield - Service Startup Guide

This guide explains how to start all CivicShield services in the correct order.

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn

## Service Architecture

```
Frontend (React + Vite)  →  Backend (Node.js + Express)  →  ML Service (FastAPI)
    Port 5173                      Port 5000                      Port 8000
```

## Quick Start (All Services)

### 1. Start ML Service (Port 8000)

```bash
cd ml-service

# Option A: Using the startup script (recommended)
./start.sh

# Option B: Manual start
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
🛡️  CivicShield ML Service Starting...
📡 Service: CivicShield ML Service v1.0.0
🌐 Host: 0.0.0.0
🔌 Port: 8000
✅ Application startup complete
```

**Health Check:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"civicshield-ml",...}
```

---

### 2. Start Backend (Port 5000)

```bash
cd backend
npm install  # First time only
npm start
```

**Expected Output:**
```
🛡️  CivicShield Gateway running on http://localhost:5000
📡 ML Service URL: http://localhost:8000
🌐 Frontend URL: http://localhost:5173
```

**Health Check:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"healthy","mlService":{"status":"healthy"},...}
```

---

### 3. Start Frontend (Port 5173)

```bash
cd frontend
npm install  # First time only
npm run dev
```

**Expected Output:**
```
VITE v8.0.3  ready in XXX ms
➜  Local:   http://localhost:5173/
```

**Access Application:**
Open browser: http://localhost:5173

---

## Troubleshooting

### ML Service Not Starting

**Problem:** `ModuleNotFoundError` or import errors

**Solution:**
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Backend Shows "ML service not reachable"

**Problem:** Backend cannot connect to ML service

**Solution:**
1. Verify ML service is running: `curl http://localhost:8000/health`
2. Check ML service logs for errors
3. Ensure port 8000 is not blocked by firewall
4. Backend will automatically retry 3 times with exponential backoff

---

### Frontend Shows 502 Error

**Problem:** Backend or ML service is down

**Solution:**
1. Check backend is running on port 5000
2. Check ML service is running on port 8000
3. Use the "Retry Connection" button in the UI
4. Check browser console for detailed error messages

---

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using the port
lsof -i :8000  # or :5000 or :5173

# Kill the process
kill -9 <PID>
```

---

## Service Health Checks

### Check All Services Status

```bash
# ML Service
curl http://localhost:8000/health

# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:5173
```

---

## Development Tips

### Auto-Restart on Code Changes

All services support hot-reload:
- **ML Service:** `--reload` flag (already enabled)
- **Backend:** Uses nodemon (if installed) or manual restart
- **Frontend:** Vite HMR (automatic)

### View Logs

Each service logs to its terminal:
- **ML Service:** Request/response logs with timestamps
- **Backend:** Request logs with status codes
- **Frontend:** Vite dev server logs

### Stop All Services

Press `Ctrl+C` in each terminal window, or:

```bash
# Kill by port
lsof -ti:8000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## Error Handling Features

### Backend Resilience
- ✅ Automatic retry (3 attempts with exponential backoff)
- ✅ Graceful error messages
- ✅ Never crashes on ML service failure
- ✅ Detailed error logging

### Frontend Resilience
- ✅ User-friendly error messages
- ✅ Retry button
- ✅ Troubleshooting hints
- ✅ Works even if backend is temporarily down

### ML Service Resilience
- ✅ Request/response logging
- ✅ Error middleware
- ✅ Health check endpoint
- ✅ Startup/shutdown event logging

---

## Production Deployment

For production, use:

```bash
# ML Service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Backend
NODE_ENV=production node src/app.js

# Frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

---

## Support

If issues persist:
1. Check all services are running
2. Verify ports are not blocked
3. Check logs for detailed error messages
4. Ensure all dependencies are installed
5. Try restarting services in order: ML → Backend → Frontend
