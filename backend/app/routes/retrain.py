"""
Retraining endpoint for model improvement.
Admin-only endpoint that retrains the spam detection model using user feedback.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import logging

from app.database import get_db
from app.models.spam_log import SpamLog
from app.models.feedback import UserFeedback
from app.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)


class RetrainResponse(BaseModel):
    message: str
    success: bool
    training_stats: Dict[str, Any]


@router.post("/retrain", response_model=RetrainResponse)
def retrain_model(
    min_feedback_count: int = 50,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Retrain spam detection model using user feedback data.
    Requires admin authentication.
    
    Parameters:
        min_feedback_count: Minimum feedback samples required for retraining
        current_user: Authenticated admin user
        db: Database session
    
    Returns:
        Training results with accuracy and version
    """
    try:
        logger.info(f"Retraining request initiated by admin {current_user.username}")
        
        # Check if sufficient feedback data exists
        feedback_count = db.query(UserFeedback).count()
        
        if feedback_count < min_feedback_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient feedback data. Need {min_feedback_count}, have {feedback_count}"
            )
        
        # Collect feedback data
        feedbacks = db.query(UserFeedback).all()
        spam_logs = db.query(SpamLog).filter(
            SpamLog.id.in_([f.spam_log_id for f in feedbacks])
        ).all()
        
        # Prepare training data
        training_data = []
        for feedback in feedbacks:
            spam_log = next((sl for sl in spam_logs if sl.id == feedback.spam_log_id), None)
            if spam_log:
                training_data.append({
                    'text': spam_log.email_text,
                    'label': feedback.corrected_result.lower(),
                    'original': feedback.original_result.lower()
                })
        
        # Import training function
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from train_model import train_model_from_data
        
        # Retrain model
        logger.info(f"Retraining model with {len(training_data)} samples")
        accuracy, version = train_model_from_data(training_data)
        
        # Reload the updated model in the service
        from app.services.model_service import spam_model
        spam_model.load_model()
        
        logger.info(f"Model retrained successfully. New accuracy: {accuracy * 100:.2f}%")
        
        return RetrainResponse(
            message="Model retrained successfully",
            success=True,
            training_stats={
                "accuracy": accuracy,
                "version": version,
                "training_samples": len(training_data),
                "previous_feedback_count": feedback_count,
                "retrained_at": datetime.now().isoformat()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining failed: {str(e)}"
        )

