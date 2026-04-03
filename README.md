# 🛡️ CivicShield — Civilian Crisis Intelligence System

A crisis intelligence dashboard that predicts resource shortages and visualizes regional risk for civilians across India.

![CivicShield](https://img.shields.io/badge/CivicShield-v1.0-00d4ff)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Python](https://img.shields.io/badge/Python-FastAPI-blue)
![React](https://img.shields.io/badge/React-Vite-purple)

## 🏗️ Architecture

```
News API → Data Agent (filter) → ML Agent (predict) → FastAPI → Node.js Gateway → React Dashboard
```

| Service | Port | Technology |
|---------|------|-----------|
| Frontend | 5173 | React + Vite |
| Backend Gateway | 5000 | Node.js + Express |
| ML Service | 8000 | Python + FastAPI |

## 🚀 Quick Start

### Option 1: Start All Services with One Command (Recommended)

```bash
# Install dependencies (first time only)
npm install

# Start all services
npm start
```

This will start ML Service (8000), Backend (5000), and Frontend (5173) concurrently.

Open **http://localhost:5173** in your browser.

---

### Option 2: Start Services Individually

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

Open **http://localhost:5173** in your browser.

---

### First Time Setup

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install                    # Root
cd backend && npm install      # Backend
cd ../frontend && npm install  # Frontend
cd ../ml-service && pip install -r requirements.txt  # ML Service
```

📖 **See [QUICK_START.md](QUICK_START.md) for detailed instructions**

## 🧠 Features

- **India Heatmap** — Interactive choropleth map with risk-based coloring
- **Risk Indicators** — High/Medium/Low state count badges
- **Prediction Cards** — LPG, Fuel, Food, Water, Medicine shortage forecasts
- **Why This Prediction** — Explainable AI with contributing factor breakdown
- **What Should You Do** — Actionable recommendations per region
- **Alerts Panel** — Real-time crisis alerts sorted by severity

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prediction` | GET | All state predictions |
| `/api/region/:state` | GET | Detailed state analysis |
| `/api/health` | GET | Service health check |

## 🔑 Configuration

Copy `.env.example` to `.env` in each service directory.

For real-time news data, add your [News API](https://newsapi.org/) key:
```
NEWS_API_KEY=your_key_here
```

Without a key, the system uses realistic seed data for demonstration.
