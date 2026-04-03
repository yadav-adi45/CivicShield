"""CivicShield — FastAPI Prediction Route"""
from fastapi import APIRouter
from datetime import datetime, timezone

from ..services.data_fetcher import fetch_crisis_data
from ..models.risk_model import compute_risk_score
from ..models.shortage_predictor import predict_shortages
from ..schemas.prediction import PredictionResponse, StatePrediction

router = APIRouter()


@router.get("/prediction", response_model=PredictionResponse)
async def get_predictions():
    """
    Get risk predictions for all Indian states.
    Returns risk scores, shortage predictions, and risk level counts.
    """
    crisis_data = await fetch_crisis_data()

    states = []
    high = medium = low = 0

    for state_data in crisis_data:
        risk = compute_risk_score(
            state_data.get("news_signals", []),
            state_data.get("baseline", {})
        )
        shortages = predict_shortages(
            state_data.get("news_signals", []),
            state_data.get("baseline", {})
        )

        level = risk["risk_level"]
        if level == "High":
            high += 1
        elif level == "Medium":
            medium += 1
        else:
            low += 1

        states.append(StatePrediction(
            state=state_data["state"],
            code=state_data["code"],
            risk=risk,
            shortages=shortages,
        ))

    # Sort by risk score descending
    states.sort(key=lambda s: s.risk.risk_score, reverse=True)

    return PredictionResponse(
        states=states,
        last_updated=datetime.now(timezone.utc).isoformat(),
        total_high_risk=high,
        total_medium_risk=medium,
        total_low_risk=low,
    )
