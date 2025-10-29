from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.use_feedback import UserFeedback
from app.models.spam_log import SpamLog
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class FeedbackCreate(BaseModel):
    spam_log_id: int
    corrected_result: str
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    spam_log_id: int
    original_result: str
    corrected_result: str
    comment: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback to correct a spam classification
    Requires authentication
    
    Args:
        feedback_data: Feedback details
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created feedback record
    """
    try:
        # Verify the spam log exists and belongs to the user
        spam_log = db.query(SpamLog).filter(
            SpamLog.id == feedback_data.spam_log_id,
            SpamLog.user_id == current_user.id
        ).first()
        
        if not spam_log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Spam log not found or does not belong to you"
            )
        
        # Validate corrected result
        if feedback_data.corrected_result.lower() not in ["spam", "ham"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrected result must be 'spam' or 'ham'"
            )
        
        # Check if feedback already exists for this log
        existing_feedback = db.query(UserFeedback).filter(
            UserFeedback.spam_log_id == feedback_data.spam_log_id
        ).first()
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.corrected_result = feedback_data.corrected_result
            existing_feedback.comment = feedback_data.comment
            db.commit()
            db.refresh(existing_feedback)
            
            # Update spam log is_correct field
            spam_log.is_correct = (spam_log.result.lower() == feedback_data.corrected_result.lower())
            db.commit()
            
            return existing_feedback
        
        # Create new feedback
        new_feedback = UserFeedback(
            user_id=current_user.id,
            spam_log_id=feedback_data.spam_log_id,
            original_result=spam_log.result,
            corrected_result=feedback_data.corrected_result,
            comment=feedback_data.comment
        )
        
        db.add(new_feedback)
        
        # Update spam log is_correct field
        spam_log.is_correct = (spam_log.result.lower() == feedback_data.corrected_result.lower())
        
        db.commit()
        db.refresh(new_feedback)
        
        return new_feedback
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

@router.get("/feedback/count")
def get_feedback_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of feedback submissions by current user
    Requires authentication
    """
    try:
        count = db.query(UserFeedback).filter(
            UserFeedback.user_id == current_user.id
        ).count()
        
        return {
            "total_feedback": count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feedback count: {str(e)}"
        )
