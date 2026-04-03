"""CivicShield ML Service — FastAPI Application Entry Point"""
import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .routes.prediction import router as prediction_router
from .routes.region import router as region_router
from .utils.config import ML_SERVICE_PORT

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CivicShield ML Service",
    description="Crisis intelligence engine for civilian resource shortage prediction",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log incoming request
    logger.info(f"[REQUEST] {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"[RESPONSE] {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")
        return response
    except Exception as e:
        logger.error(f"[ERROR] {request.method} {request.url.path} - Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": str(e),
                "path": request.url.path
            }
        )

# Routes
app.include_router(prediction_router)
app.include_router(region_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "CivicShield ML Service",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "civicshield-ml",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("=" * 60)
    logger.info("🛡️  CivicShield ML Service Starting...")
    logger.info(f"📡 Service: CivicShield ML Service v1.0.0")
    logger.info(f"🌐 Host: 0.0.0.0")
    logger.info(f"🔌 Port: {ML_SERVICE_PORT}")
    logger.info(f"🕐 Started at: {datetime.utcnow().isoformat()}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown information"""
    logger.info("🛑 CivicShield ML Service shutting down...")


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting ML Service on 0.0.0.0:{ML_SERVICE_PORT}")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=ML_SERVICE_PORT,
        reload=True,
        log_level="info"
    )
