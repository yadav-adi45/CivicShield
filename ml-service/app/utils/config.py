"""CivicShield ML Service — Configuration"""
import os
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_BASE = "https://newsapi.org/v2/everything"
ML_SERVICE_PORT = int(os.getenv("ML_SERVICE_PORT", "8000"))
DATA_REFRESH_INTERVAL = int(os.getenv("DATA_REFRESH_INTERVAL", "900"))  # 15 min

# Risk thresholds
HIGH_RISK_THRESHOLD = 0.7
MEDIUM_RISK_THRESHOLD = 0.4

# Scoring weights
WEIGHT_SUPPLY_DISRUPTION = 0.4
WEIGHT_DEMAND_SPIKE = 0.3
WEIGHT_NEWS_SEVERITY = 0.3
