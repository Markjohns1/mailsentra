from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.feedback import UserFeedback
from app.models.spam_log import SpamLog
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class FeedbackRequest(BaseModel):
    spam_log_id: int
    corrected_result: str
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    message: str
    feedback_id: int
    spam_log_id: int
    original_result: str
    corrected_result: str

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    feedback_data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback on spam detection result
    Requires authentication
    
    Args:
        feedback_data: Feedback information
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Feedback confirmation
    """
    try:
        # Validate corrected_result
        if feedback_data.corrected_result.lower() not in ["spam", "ham", "not spam"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid corrected_result. Must be 'spam', 'ham', or 'not spam'"
            )
        
        # Get the spam log
        spam_log = db.query(SpamLog).filter(
            SpamLog.id == feedback_data.spam_log_id,
            SpamLog.user_id == current_user.id
        ).first()
        
        if not spam_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Spam log not found"
            )
        
        # Normalize corrected result
        corrected = "spam" if "spam" in feedback_data.corrected_result.lower() else "ham"
        
        # Check if result matches (is correct)
        is_correct = (
            spam_log.result.lower() == corrected.capitalize() or
            (spam_log.result.lower() == "spam" and corrected == "spam") or
            (spam_log.result.lower() == "not spam" and corrected == "ham")
        )
        
        # Update spam log with is_correct flag
        spam_log.is_correct = is_correct
        
        # Create feedback record
        feedback = UserFeedback(
            user_id=current_user.id,
            spam_log_id=feedback_data.spam_log_id,
            original_result=spam_log.result,
            corrected_result=corrected.capitalize(),
            comment=feedback_data.comment
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        db.refresh(spam_log)
        
        return FeedbackResponse(
            message=f"Feedback submitted successfully",
            feedback_id=feedback.id,
            spam_log_id=feedback_data.spam_log_id,
            original_result=spam_log.result,
            corrected_result=corrected.capitalize()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.get("/feedback/user")
def get_user_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all feedback submitted by the current user
    Requires authentication
    """
    try:
        feedbacks = db.query(UserFeedback).filter(
            UserFeedback.user_id == current_user.id
        ).order_by(UserFeedback.created_at.desc()).all()
        
        return {
            "count": len(feedbacks),
            "feedbacks": [
                {
                    "id": f.id,
                    "spam_log_id": f.spam_log_id,
                    "original_result": f.original_result,
                    "corrected_result": f.corrected_result,
                    "comment": f.comment,
                    "created_at": f.created_at
                }
                for f in feedbacks
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feedback: {str(e)}"
        )

