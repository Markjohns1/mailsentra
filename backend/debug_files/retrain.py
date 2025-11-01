from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import logging
import sys
import os

from app.database import get_db
from app.models.spam_log import SpamLog
from app.models.use_feedback import UserFeedback
from app.dependencies import get_current_admin_user
from app.models.user import User 

router = APIRouter()
logger = logging.getLogger(__name__)

class RetrainResponse(BaseModel):
    message: str
    success: bool
    training_stats: Dict[str, Any]

class RetrainStatusResponse(BaseModel): 
    ready_to_retrain: bool # is the model ready to retrain? (True or False)  . depends on the feedback count and the minimum(10) required feedback count
    feedback_count: int
    min_required: int
    message: str

@router.get("/retrain/status", response_model=RetrainStatusResponse)
def get_retrain_status(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Check if model is ready for retraining"""
    try:
        min_feedback = 10
        feedback_count = db.query(UserFeedback).filter(
            UserFeedback.original_result != UserFeedback.corrected_result
        ).count()

        ready = feedback_count >= min_feedback

        return RetrainStatusResponse(
            ready_to_retrain=ready,
            feedback_count=feedback_count,
            min_required=min_feedback,
            message=f"{'Ready to retrain' if ready else f'Need {min_feedback - feedback_count} more feedback samples'}"
        )
    except Exception as e:
        logger.error(f"Error checking retrain status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/train", response_model=RetrainResponse)
def train_initial_model(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Train model from scratch using the SMS Spam Collection dataset"""
    try:
        logger.info(f"Initial training request initiated by admin {current_user.username}")

        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from train_model import main as train_main

        train_main()

        from app.services.model_service import spam_model
        spam_model.load_model()

        logger.info(f"Model trained successfully")

        return RetrainResponse(
            message="Model trained successfully from dataset",
            success=True,
            training_stats={
                "accuracy": spam_model.metadata.get('accuracy', 0),
                "version": str(spam_model.metadata.get('version', 'unknown')),
                "training_samples": 5574, # 5574 is gotten from the dataset/SMSSpamCollection file in the dataset folder in the backend(spam-detection-api) directory
                "trained_at": datetime.now().isoformat(),
                "retrained": False
            }
        )

    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )

@router.post("/retrain", response_model=RetrainResponse)
def retrain_model(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Retrain spam detection model using user feedback data"""
    try:
        logger.info(f"Retraining request initiated by admin {current_user.username}")

        min_feedback_count = 10

        feedbacks = db.query(UserFeedback).filter(
            UserFeedback.original_result != UserFeedback.corrected_result
        ).all()

        if len(feedbacks) < min_feedback_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient feedback data. Need {min_feedback_count}, have {len(feedbacks)}"
            )

        logger.info(f"Collecting {len(feedbacks)} misclassified samples...")

        training_data = []
        for feedback in feedbacks:
            spam_log = db.query(SpamLog).filter(
                SpamLog.id == feedback.spam_log_id
            ).first()

            if spam_log and spam_log.email_text:
                training_data.append({
                    'text': spam_log.email_text,
                    'label': feedback.corrected_result.lower().strip()
                })

        if not training_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid training data found in feedback"
            )

        logger.info(f"Prepared {len(training_data)} training samples")

        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from train_model import train_model_from_data

        accuracy, version = train_model_from_data(training_data)

        from app.services.model_service import spam_model
        spam_model.load_model() 

        logger.info(f"Model v{version} retrained successfully. New accuracy: {accuracy * 100:.2f}%")

        return RetrainResponse(
            message=f"Model retrained successfully to v{version}",
            success=True,
            training_stats={
                "accuracy": float(accuracy),
                "version": str(version),
                "training_samples": len(training_data),
                "feedback_used": len(feedbacks),
                "retrained_at": datetime.now().isoformat(),
                "retrained": True
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Retraining failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retraining failed: {str(e)}" 
        )
