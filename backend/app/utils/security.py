# app/utils/security.py
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from app.config import settings

# -------------------------------------------------------------------------
# Password hashing: support legacy bcrypt + new pbkdf2_sha256
# -------------------------------------------------------------------------
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],  # both supported
    deprecated="auto"                     # auto-upgrade bcrypt → pbkdf2_sha256
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verify password. Returns False on unknown hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except UnknownHashError:
        return False
    except Exception as e:
        # Optional: log unexpected errors
        print(f"Unexpected error in verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash password using preferred scheme (pbkdf2_sha256)"""
    return pwd_context.hash(password)

# -------------------------------------------------------------------------
# JWT Token Functions
# -------------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a long-lived refresh token"""
    to_encode = data.copy()
    # Refresh tokens typically last much longer (e.g., 7 days)
    expire = datetime.utcnow() + (
        expires_delta or timedelta(days=7)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
