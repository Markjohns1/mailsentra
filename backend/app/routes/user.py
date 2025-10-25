from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class DashboardResponse(BaseModel):
    user: Dict[str, Any]
    stats: Dict[str, Any]
    message: str

@router.get("/dashboard", response_model=DashboardResponse)
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user dashboard data
    Requires authentication
    """
    # Get user stats (placeholder for now)
    stats = {
        "total_emails_analyzed": 0,
        "spam_detected": 0,
        "ham_detected": 0,
        "accuracy_rate": 0.0
    }
    
    return DashboardResponse(
        user={
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "is_active": current_user.is_active,
            "is_admin": current_user.is_admin
        },
        stats=stats,
        message="Welcome to your dashboard!"
    )

@router.post("/logout")
def logout_user():
    """
    Logout endpoint (client-side token removal)
    """
    return {"message": "Logged out successfully"}
