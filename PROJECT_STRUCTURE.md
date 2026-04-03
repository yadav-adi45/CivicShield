# CivicShield - Project Structure

## Directory Overview

```
CivicShield/
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard/   # Main dashboard component
│   │   │   ├── Header/      # Header with controls
│   │   │   ├── HeatMap/     # India map visualization
│   │   │   ├── PredictionCards/  # Resource shortage cards
│   │   │   ├── ExplainPanel/     # AI explanation panel
│   │   │   ├── ActionPanel/      # Recommended actions
│   │   │   ├── AlertsPanel/      # Crisis alerts
│   │   │   └── RiskIndicators/   # Risk badges
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js + Express gateway
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── prediction.js    # Prediction endpoints
│   │   │   ├── region.js        # Region detail endpoints
│   │   │   ├── chat.js          # AI chatbot endpoints
│   │   │   └── news.js          # News API endpoints
│   │   ├── services/        # Business logic
│   │   │   └── mlProxy.js       # ML service proxy
│   │   ├── middleware/      # Express middleware
│   │   │   └── errorHandler.js  # Error handling
│   │   └── app.js           # Express app setup
│   ├── .env                 # Environment variables
│   └── package.json
│
├── ml-service/              # Python + FastAPI ML service
│   ├── app/
│   │   ├── routes/          # API routes
│   │   │   ├── prediction.py    # Prediction logic
│   │   │   └── region.py        # Region analysis
│   │   ├── models/          # ML models
│   │   │   ├── risk_model.py    # Risk scoring
│   │   │   └── shortage_predictor.py  # Shortage prediction
│   │   ├── services/        # Business logic
│   │   │   ├── data_fetcher.py  # Data collection
│   │   │   ├── crisis_filter.py # Crisis detection
│   │   │   └── explainer.py     # AI explanations
│   │   ├── utils/           # Utilities
│   │   │   ├── config.py        # Configuration
│   │   │   └── constants.py     # Constants
│   │   └── main.py          # FastAPI app
│   ├── data/                # Seed data
│   ├── venv/                # Python virtual environment
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
├── package.json             # Root package.json (for npm start)
├── start-all.sh             # Bash script to start all services
├── test-system.sh           # System integration test
├── README.md                # Main documentation
├── QUICK_START.md           # Quick start guide
├── START_SERVICES.md        # Detailed service startup guide
└── .gitignore               # Git ignore rules
```

---

## Service Communication Flow

```
User Browser
    ↓
Frontend (React) :5173
    ↓ HTTP
Backend (Node.js) :5000
    ↓ HTTP
ML Service (FastAPI) :8000
    ↓
Crisis Data + Predictions
```

---

## Key Files

### Root Level

| File | Purpose |
|------|---------|
| `package.json` | Root npm scripts for starting all services |
| `start-all.sh` | Bash script to start all services concurrently |
| `test-system.sh` | Integration test for all services |
| `QUICK_START.md` | Quick start guide |
| `START_SERVICES.md` | Detailed startup instructions |
| `.gitignore` | Git ignore patterns |

### Frontend

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app component |
| `src/components/Dashboard/Dashboard.jsx` | Main dashboard with all features |
| `src/hooks/usePredictions.js` | Hook for fetching predictions |
| `src/hooks/useRegion.js` | Hook for region details |
| `src/services/api.js` | API client with error handling |
| `vite.config.js` | Vite configuration |

### Backend

| File | Purpose |
|------|---------|
| `src/app.js` | Express app setup and middleware |
| `src/routes/prediction.js` | Prediction API routes |
| `src/routes/region.js` | Region detail routes |
| `src/routes/chat.js` | AI chatbot routes (Groq API) |
| `src/routes/news.js` | News API routes (GNews) |
| `src/services/mlProxy.js` | ML service proxy with retry logic |
| `src/middleware/errorHandler.js` | Global error handler |
| `.env` | Environment variables (API keys) |

### ML Service

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app with logging |
| `app/routes/prediction.py` | Prediction endpoints |
| `app/routes/region.py` | Region analysis endpoints |
| `app/models/risk_model.py` | Risk scoring algorithm |
| `app/models/shortage_predictor.py` | Shortage prediction model |
| `app/services/data_fetcher.py` | Data collection service |
| `app/services/crisis_filter.py` | Crisis detection logic |
| `app/services/explainer.py` | AI explanation generator |
| `app/utils/config.py` | Configuration management |
| `.env` | Environment variables |

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
ML_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=<your_groq_api_key>
NEWS_API_KEY=<your_gnews_api_key>
```

### ML Service (.env)
```env
ML_SERVICE_PORT=8000
NEWS_API_KEY=<optional>
DATA_REFRESH_INTERVAL=900
```

---

## API Endpoints

### Backend Gateway

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with ML service status |
| `/api/prediction` | GET | All state predictions |
| `/api/region/:state` | GET | Detailed state analysis |
| `/api/chat` | POST | AI chatbot (Groq API) |
| `/api/news` | GET | Crisis news (GNews API) |

### ML Service

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/` | GET | Service info |
| `/prediction` | GET | Generate predictions for all states |
| `/region/{state_code}` | GET | Detailed analysis for specific state |

---

## Data Flow

### Prediction Flow
1. Frontend requests `/api/prediction`
2. Backend proxies to ML Service `/prediction`
3. ML Service:
   - Fetches crisis data
   - Runs risk scoring model
   - Generates shortage predictions
   - Returns structured data
4. Backend adds retry logic and error handling
5. Frontend displays on dashboard

### Region Detail Flow
1. User clicks state on map
2. Frontend requests `/api/region/:state`
3. Backend proxies to ML Service `/region/{state}`
4. ML Service:
   - Analyzes state-specific data
   - Generates explanations
   - Provides recommendations
5. Frontend displays in detail panel

### Chat Flow
1. User sends message in chatbot
2. Frontend posts to `/api/chat`
3. Backend calls Groq API
4. Groq returns AI response
5. Frontend displays in chat

### News Flow
1. Frontend requests `/api/news`
2. Backend calls GNews API
3. Backend filters for crisis relevance
4. Returns articles with fallback
5. Frontend displays in news panel

---

## Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** CSS with CSS Variables
- **State Management:** React Hooks
- **HTTP Client:** Fetch API
- **Charts:** Recharts
- **Map:** Custom SVG with D3-like interactions

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **HTTP Client:** Axios
- **Middleware:** CORS, Morgan, Rate Limiting
- **Error Handling:** Custom middleware

### ML Service
- **Language:** Python 3.8+
- **Framework:** FastAPI
- **Server:** Uvicorn
- **HTTP Client:** httpx
- **Data Validation:** Pydantic
- **Logging:** Python logging

---

## Development Workflow

### Adding a New Feature

1. **Frontend Component:**
   - Create component in `frontend/src/components/`
   - Add styles in component folder
   - Import in Dashboard or App

2. **Backend Route:**
   - Create route in `backend/src/routes/`
   - Add to `app.js`
   - Add error handling

3. **ML Service Endpoint:**
   - Create route in `ml-service/app/routes/`
   - Add business logic in `services/`
   - Update main.py if needed

### Testing Changes

1. Start all services: `npm start`
2. Check browser console for errors
3. Check backend logs for API errors
4. Check ML service logs for processing errors
5. Run system test: `npm run test:system`

---

## Deployment

### Development
```bash
npm start
```

### Production

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ with nginx
```

**Backend:**
```bash
cd backend
NODE_ENV=production node src/app.js
```

**ML Service:**
```bash
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Troubleshooting

### Common Issues

1. **Port in use:** Kill process with `lsof -ti:PORT | xargs kill -9`
2. **ML service not starting:** Check Python venv is activated
3. **Backend can't reach ML:** Verify ML service is running on 8000
4. **Frontend shows errors:** Check backend is running on 5000
5. **News not loading:** Check NEWS_API_KEY in backend/.env
6. **Chatbot not working:** Check GROQ_API_KEY in backend/.env

### Logs Location

- **Frontend:** Browser console
- **Backend:** Terminal output
- **ML Service:** Terminal output

---

## Performance

### Optimization Techniques

1. **Frontend:**
   - React.memo for expensive components
   - useMemo for computed values
   - useCallback for event handlers
   - Lazy loading for heavy components

2. **Backend:**
   - Request retry with exponential backoff
   - Connection pooling
   - Error caching

3. **ML Service:**
   - Request logging middleware
   - Async processing
   - Data caching (future)

---

## Security

### Best Practices

1. **API Keys:** Stored in .env files (never committed)
2. **CORS:** Configured for specific origins
3. **Rate Limiting:** Applied to all API routes
4. **Error Handling:** Never exposes internal details
5. **Input Validation:** Pydantic models in ML service

---

## Maintenance

### Regular Tasks

1. Update dependencies monthly
2. Review and rotate API keys
3. Monitor API usage/quotas
4. Check error logs
5. Update fallback news content
6. Review and update crisis keywords

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
1. Check QUICK_START.md
2. Review START_SERVICES.md
3. Check logs for errors
4. Run system test: `npm run test:system`
