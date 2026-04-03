# CivicShield - Quick Start Guide

## Start All Services with One Command

### Option 1: Using npm (Recommended)

1. **Install concurrently (one-time setup):**
   ```bash
   npm install
   ```

2. **Start all services:**
   ```bash
   npm start
   ```

This will start:
- 🔬 ML Service on port 8000
- 🔧 Backend on port 5000
- 🌐 Frontend on port 5173

---

### Option 2: Using the Bash Script

1. **Make script executable (one-time setup):**
   ```bash
   chmod +x start-all.sh
   ```

2. **Run the script:**
   ```bash
   ./start-all.sh
   ```

---

### Option 3: Manual Start (Individual Terminals)

**Terminal 1 - ML Service:**
```bash
cd ml-service
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## First Time Setup

If this is your first time running the project:

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   Or manually:
   ```bash
   # Root
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   
   # Frontend
   cd frontend
   npm install
   cd ..
   
   # ML Service
   cd ml-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

2. **Configure environment variables:**
   
   Backend `.env` should have:
   ```env
   PORT=5000
   ML_SERVICE_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173
   GROQ_API_KEY=YOUR_GROQ_API_KEY
   NEWS_API_KEY=89ec8e8af4f8848a6bda9d9c9a4e4127
   ```
   
   ML Service `.env` should have:
   ```env
   ML_SERVICE_PORT=8000
   NEWS_API_KEY=
   DATA_REFRESH_INTERVAL=900
   ```

3. **Start all services:**
   ```bash
   npm start
   ```

---

## Stopping Services

**If using npm start or bash script:**
- Press `Ctrl+C` to stop all services

**If running manually:**
- Press `Ctrl+C` in each terminal

---

## Verify Services are Running

Run the system test:
```bash
npm run test:system
```

Or manually check:
```bash
# ML Service
curl http://localhost:8000/health

# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:5173
```

---

## Access the Application

Once all services are running:

🌐 **Open in browser:** http://localhost:5173

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### ML Service Won't Start

```bash
cd ml-service
source venv/bin/activate
pip install -r requirements.txt
```

### Backend Won't Start

```bash
cd backend
npm install
npm start
```

### Frontend Won't Start

```bash
cd frontend
npm install
npm run dev
```

---

## Development Tips

### Hot Reload

All services support hot reload:
- **ML Service:** Automatically reloads on code changes
- **Backend:** Automatically reloads on code changes
- **Frontend:** Vite HMR (instant updates)

### View Logs

When using `npm start`, all logs are prefixed:
- `[ML]` - ML Service logs
- `[BACKEND]` - Backend logs
- `[FRONTEND]` - Frontend logs

### Individual Service Commands

```bash
# Start only ML Service
npm run start:ml

# Start only Backend
npm run start:backend

# Start only Frontend
npm run start:frontend
```

---

## Production Deployment

For production, use:

```bash
# ML Service
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Backend
cd backend
NODE_ENV=production node src/app.js

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

---

## System Requirements

- **Node.js:** v16 or higher
- **Python:** 3.8 or higher
- **npm:** v8 or higher
- **pip:** Latest version

---

## Support

If you encounter issues:

1. Check all services are running: `npm run test:system`
2. Review logs for errors
3. Ensure all dependencies are installed
4. Verify environment variables are set
5. Check ports are not in use

---

## Quick Reference

| Service | Port | Health Check |
|---------|------|--------------|
| ML Service | 8000 | http://localhost:8000/health |
| Backend | 5000 | http://localhost:5000/api/health |
| Frontend | 5173 | http://localhost:5173 |

---

**Happy Coding! 🛡️**
