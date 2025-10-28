"""API key management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import secrets
import hashlib

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database import Base

router = APIRouter()

"""API Key model."""
"""class APIKey(Base):
    
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String, nullable=False, unique=True, index=True)
    key_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
   expires_at = Column(DateTime(timezone=True), nullable=True)
"""

class GenerateKeyRequest(BaseModel):
    key_name: str
    expires_in_days: int = 365


class GenerateKeyResponse(BaseModel):
    api_key: str
    key_id: int
    expires_at: str
    message: str


def hash_api_key(key: str) -> str:
    """Hash API key for storage."""
    return hashlib.sha256(key.encode()).hexdigest()


def generate_api_key() -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(32)


@router.post("/generate", response_model=GenerateKeyResponse)
def generate_api_key_endpoint(
    request: GenerateKeyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a new API key for authenticated user.
    
    Parameters i take here include:-
        request:     Key name and expiration
        current_user: Authenticated user
        db:           Database session
    
    Returns:
        Generated API key (displayed only once)
    """
    try:
        # Generate API key
        api_key = generate_api_key()
        key_hash = hash_api_key(api_key)
        
        # Calculate expiration
        expires_at = None
        if request.expires_in_days > 0:
            expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
        
        # Store in database
        db_key = APIKey(
            user_id=current_user.id,
            key_hash=key_hash,
            key_name=request.key_name,
            is_active=True,
            expires_at=expires_at
        )
        
        db.add(db_key)
        db.commit()
        db.refresh(db_key)
        
        return GenerateKeyResponse(
            api_key=api_key,
            key_id=db_key.id,
            expires_at=expires_at.isoformat() if expires_at else "Never",
            message="Save this key securely. It will not be shown again."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate API key: {str(e)}"
        )


@router.get("/keys")
def list_user_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all API keys for the authenticated user.
    """
    try:
        keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
        
        return {
            "count": len(keys),
            "keys": [
                {
                    "id": k.id,
                    "key_name": k.key_name,
                    "is_active": k.is_active,
                    "last_used": k.last_used.isoformat() if k.last_used else None,
                    "created_at": k.created_at.isoformat(),
                    "expires_at": k.expires_at.isoformat() if k.expires_at else None
                }
                for k in keys
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list keys: {str(e)}"
        )


@router.delete("/keys/{key_id}")
def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoke an API key by ID.
    """
    try:
        key = db.query(APIKey).filter(
            APIKey.id == key_id,
            APIKey.user_id == current_user.id
        ).first()
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        db.delete(key)
        db.commit()
        
        return {"message": "API key revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke key: {str(e)}"
        )


def verify_api_key(key: str, db: Session) -> APIKey:
    """
    Verify API key and return key object.
    
    Parameters:
        key: API key to verify
        db: Database session
    
    Returns:
        APIKey object if valid
    
    Raises:
        HTTPException if key is invalid
    """
    key_hash = hash_api_key(key)
    
    db_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True
    ).first()
    
    if not db_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Check expiration
    if db_key.expires_at and db_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired"
        )
    
    # Update last used
    db_key.last_used = datetime.utcnow()
    db.commit()
    
    return db_key