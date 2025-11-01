from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.database import get_db
from app.models.spam_log import SpamLog
from app.services.model_service import spam_model
from app.dependencies import get_current_user
from app.models.user import User
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    email_text: str
    email_id: Optional[int] = None

class AnalyzeResponse(BaseModel):
    result: str
    confidence: float
    is_spam: bool
    message: str
    model_version: str
    processed_text: str
    original_length: int
    processed_length: int

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_email(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze email for spam
    Requires authentication
    
    Args:
        request: Email text to analyze
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Analysis result with confidence score
    """
    try:
        logger.info(f"Analyzing email for user {current_user.id}")
        
        if not request.email_text or len(request.email_text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email text cannot be empty"
            )
        
        # Get prediction from model
        prediction_result = spam_model.predict(request.email_text)
        
        if "error" in prediction_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Model prediction failed: {prediction_result['error']}"
            )
        
        result = prediction_result.get("result", "unknown")
        confidence = prediction_result.get("confidence", 0.0)
        is_spam = result == "spam"
        
        # Log the analysis result to database
        spam_log = SpamLog(
            user_id=current_user.id,
            email_id=request.email_id,
            email_text=request.email_text[:500],  # Limit to first 500 chars
            result=result.capitalize(),
            confidence=confidence,
            model_version=prediction_result.get("model_version", "unknown"),
            is_correct=None  # No feedback yet
        )
        
        db.add(spam_log)
        db.commit()
        db.refresh(spam_log)
        
        logger.info(f"Analysis complete: {result.upper()} (confidence: {confidence*100:.2f}%)")
        
        return AnalyzeResponse(
            result=result,
            confidence=confidence,
            is_spam=is_spam,
            message=f"Email classified as {result.upper()} with {confidence*100:.2f}% confidence",
            model_version=prediction_result.get("model_version", "unknown"),
            processed_text=prediction_result.get("processed_text", ""),
            original_length=prediction_result.get("original_length", 0),
            processed_length=prediction_result.get("processed_length", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/model/info")
def get_model_info():
    """
    Get information about the loaded ML model
    """
    try:
        info = spam_model.get_model_info()
        return info
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}"
        )

