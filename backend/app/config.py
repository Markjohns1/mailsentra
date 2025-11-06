from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv
import pytz

load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    PROJECT_NAME: str = "Spam Detection API"
    API_V1_STR: str = "/api"
    VERSION: str = "1.0.0"
    
    # Timezone Configuration
    TIMEZONE: str = os.getenv("TIMEZONE", "Africa/Nairobi")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spam_detector.db")
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS - environment-based
    BACKEND_CORS_ORIGINS: List[str] = os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5000,http://127.0.0.1:5173"
    ).split(",")
    
    # Admin - no defaults, must be set via environment
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # ML Model
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./ml_models/spam_model.pkl")
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "1.0.0")
    
    @property
    def tz(self):
        """Get timezone object"""
        return pytz.timezone(self.TIMEZONE)
    
    class Config:
        case_sensitive = True

settings = Settings()

# Validate critical settings in production
if os.getenv("ENVIRONMENT", "development") == "production":
    if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
        raise ValueError("SECRET_KEY must be set and at least 32 characters in production")
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        raise ValueError("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production")