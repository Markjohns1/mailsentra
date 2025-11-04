from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from app.database import engine
from app.routes import auth, user, preprocessing, analyze, logs, feedback, admin, retrain, api_keys, metrics, model_info, training
from app.config import settings
from slowapi.errors import RateLimitExceeded
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.services.model_service import spam_model

limiter = Limiter(key_func=get_remote_address)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("Starting up Spam Detection API...")
    if not spam_model.is_loaded:
        logger.warning("Model not loaded! Run 'python train_model.py' first")
    else:
        logger.info("Spam detection model ready")
        logger.info(f"   - Version: {spam_model.metadata.get('version', 'unknown')}")
        logger.info(f"   - Accuracy: {spam_model.metadata.get('accuracy', 0) * 100:.2f}%")
    yield
    logger.info("Shutting down Spam Detection API...")

app = FastAPI(
    title="Spam Detection API",
    description="Email spam detection system using Machine Learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded errors"""
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": str(exc.retry_after)
        },
        headers={"Retry-After": str(exc.retry_after)}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers AFTER app is created
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(preprocessing.router, prefix="/api/preprocessing", tags=["Preprocessing"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(logs.router, prefix="/api", tags=["Logs"])
app.include_router(feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(retrain.router, prefix="/api/retrain", tags=["Retraining"])
app.include_router(api_keys.router, prefix="/api/token", tags=["API Keys"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(model_info.router, prefix="/api/model", tags=["Model Management"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(training.router, prefix="/api/admin", tags=["admin-training"])

@app.get("/")
def read_root():
    """Root endpoint - API health check"""
    return {
        "message": "Spam Detection API is running",
        "status": "success",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "spam-detection-api"
    }

@app.get("/test-db")
def test_database():
    """Test database connection and verify tables exist"""
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return {
        "status": "success",
        "database": "connected",
        "tables": tables,
        "count": len(tables)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )