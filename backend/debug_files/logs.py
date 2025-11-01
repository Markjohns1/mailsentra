from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.spam_log import SpamLog
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

class SpamLogResponse(BaseModel):
    id: int
    result: str
    confidence: Optional[float]
    model_version: Optional[str]
    is_correct: Optional[bool]
    created_at: datetime
    email_text: str
    
    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[SpamLogResponse])
def get_user_logs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    result_filter: Optional[str] = Query(None, description="Filter by result: spam, ham"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's spam analysis logs
    Requires authentication
    
    Args:
        limit: Number of logs to return
        offset: Number of logs to skip
        result_filter: Filter by result type
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of spam logs
    """
    try:
        # Base query for user's logs
        query = db.query(SpamLog).filter(SpamLog.user_id == current_user.id)
        
        # Apply filter if provided
        if result_filter:
            query = query.filter(SpamLog.result.ilike(f"%{result_filter}%"))
        
        # Order by created_at descending (newest first)
        query = query.order_by(SpamLog.created_at.desc())
        
        # Apply pagination
        logs = query.offset(offset).limit(limit).all()
        
        total_count = query.count()
        
        return logs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve logs: {str(e)}"
        )

@router.get("/logs/stats")
def get_logs_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics for user's logs
    Requires authentication
    
    Returns:
        Statistics: total, spam count, ham count, accuracy rate
    """
    try:
        # Get all logs for user
        all_logs = db.query(SpamLog).filter(SpamLog.user_id == current_user.id).all()
        
        total = len(all_logs)
        spam_count = sum(1 for log in all_logs if log.result.lower() == "spam")
        ham_count = total - spam_count
        
        # Get accuracy (logs with feedback)
        feedback_logs = [log for log in all_logs if log.is_correct is not None]
        accurate = sum(1 for log in feedback_logs if log.is_correct)
        accuracy_rate = (accurate / len(feedback_logs)) * 100 if feedback_logs else 0
        
        return {
            "total_analyses": total,
            "spam_detected": spam_count,
            "ham_detected": ham_count,
            "feedback_count": len(feedback_logs),
            "accuracy_rate": round(accuracy_rate, 2),
            "spam_percentage": round((spam_count / total * 100), 2) if total > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )

