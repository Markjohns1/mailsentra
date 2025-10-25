from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.spam_log import SpamLog
from app.models.feedback import UserFeedback
from app.dependencies import get_current_admin_user
from pydantic import BaseModel

router = APIRouter()

@router.get("/users")
def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all users (Admin only)
    Requires admin authentication
    """
    try:
        users = db.query(User).all()
        return {
            "count": len(users),
            "users": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "is_active": u.is_active,
                    "is_admin": u.is_admin,
                    "created_at": u.created_at
                }
                for u in users
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )

@router.get("/stats")
def get_system_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get system-wide statistics (Admin only)
    Requires admin authentication
    """
    try:
        total_users = db.query(User).count()
        total_logs = db.query(SpamLog).count()
        total_feedback = db.query(UserFeedback).count()
        
        # Get spam vs ham ratio
        spam_count = db.query(SpamLog).filter(SpamLog.result.ilike("%spam%")).count()
        ham_count = total_logs - spam_count
        
        # Get accuracy from feedback
        feedback_logs = db.query(UserFeedback).all()
        accurate_count = sum(1 for f in feedback_logs if "spam" in f.original_result.lower() == "spam" in f.corrected_result.lower())
        accuracy = (accurate_count / len(feedback_logs) * 100) if feedback_logs else 0
        
        return {
            "total_users": total_users,
            "total_analyses": total_logs,
            "spam_detected": spam_count,
            "ham_detected": ham_count,
            "total_feedback": total_feedback,
            "system_accuracy": round(accuracy, 2),
            "spam_percentage": round((spam_count / total_logs * 100), 2) if total_logs > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a user (Admin only)
    Requires admin authentication
    """
    try:
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete yourself"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db.delete(user)
        db.commit()
        
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

