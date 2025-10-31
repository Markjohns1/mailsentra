from fastapi import APIRouter, Depends, HTTPException, status # fastapi is a web framework for building APIs , Depends is a dependency injection, HTTPException is a HTTP exception, status is a HTTP status code, Session is a database session, BaseModel is a Pydantic model, Dict is a dictionary, Any is a type, router is a FastAPI router, logger is a logger, router is a FastAPI router
from sqlalchemy.orm import Session # sqlalchemy is a database ORM, Session is a database session
from app.database import get_db # get_db is a function that returns a database session
from app.models.user import User # User is a model that represents a user
from app.dependencies import get_current_user # get_current_user is a function that returns a current user
from pydantic import BaseModel # BaseModel is a Pydantic model
from typing import Dict, Any # Dict is a dictionary, Any is a generic type

router = APIRouter() # router is a FastAPI router(in simple terms, it is a route that the user can access to get the dashboard data)
#
class DashboardResponse(BaseModel):
    user: Dict[str, Any]
    stats: Dict[str, Any]
    message: str

@router.get("/dashboard", response_model=DashboardResponse) #endpoint for the get user dashboard data endpoint. this is the endpoint that the user can access to get the dashboard data. other wise, the user cannot get the dashboard data.
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

@router.post("/logout") #route for the logout user endpoint. this is the endpoint that the user can access to logout. other wise, the user cannot logout.
def logout_user(): # logout user (client-side token removal). this is how it works: when the user logs out, the token is removed from the client-side(browser) and the user is logged out. the token is removed from the client-side(browser) by the logout_user function.
    # i only see a function, no where the token is removed from the client-side(browser) in the code..how is the token removed? by the logout_user function. the logout_user function removes the token from the client-side(browser) by the logout_user function.
    """
    Logout endpoint (client-side token removal)
    """
    return {"message": "Logged out successfully"} #how is the token removed? by the logout_user function. the logout_user function removes the token from the client-side(browser) by the logout_user function.
