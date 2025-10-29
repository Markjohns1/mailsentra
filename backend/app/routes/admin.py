from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User
from app.models.spam_log import SpamLog
from app.models.use_feedback import UserFeedback
from app.models.api_key import APIKey
from app.models.email import Email
from app.dependencies import get_current_admin_user

router = APIRouter()

#  SCHEMAS 
class UserUpdateSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class APIKeyCreateSchema(BaseModel):
    user_id: int
    name: str
    expires_in_days: Optional[int] = None

#  USER MANAGEMENT 
@router.get("/users")
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    is_active: Optional[bool] = None,
    is_admin: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users with optional filters"""
    try:
        query = db.query(User)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if is_admin is not None:
            query = query.filter(User.is_admin == is_admin)
        
        total = query.count()
        users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_active": user.is_active,
                    "is_admin": user.is_admin,
                    "created_at": user.created_at
                }
                for user in users
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )


# ADD THIS TO app/routes/admin.py after the get_all_users function

class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_active: bool = True
    is_admin: bool = False

@router.post("/users/create")
def create_user(
    user_data: UserCreateSchema,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    try:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        
        from app.utils.security import get_password_hash
        
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            is_active=user_data.is_active,
            is_admin=user_data.is_admin
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "message": "User created successfully",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "is_active": new_user.is_active,
                "is_admin": new_user.is_admin,
                "created_at": new_user.created_at
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's spam logs count
        total_scans = db.query(SpamLog).filter(SpamLog.user_id == user_id).count()
        spam_detected = db.query(SpamLog).filter(
            SpamLog.user_id == user_id,
            SpamLog.result.ilike("%spam%")
        ).count()
        
        # Get user's feedback count
        total_feedback = db.query(UserFeedback).filter(UserFeedback.user_id == user_id).count()
        
        # Get user's API keys
        api_keys = db.query(APIKey).filter(APIKey.user_id == user_id).all()
        
        return {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "created_at": user.created_at
            },
            "activity": {
                "total_scans": total_scans,
                "spam_detected": spam_detected,
                "total_feedback": total_feedback,
                "api_keys_count": len(api_keys)
            },
            "api_keys": [
                {
                    "id": key.id,
                    "name": key.name,
                    "is_active": key.is_active,
                    "created_at": key.created_at
                }
                for key in api_keys
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user details: {str(e)}"
        )

@router.patch("/users/{user_id}")
def update_user(
    user_id: int,
    user_update: UserUpdateSchema,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user information"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields if provided
        if user_update.username is not None:
            user.username = user_update.username
        if user_update.email is not None:
            user.email = user_update.email
        if user_update.is_active is not None:
            user.is_active = user_update.is_active
        if user_update.is_admin is not None:
            user.is_admin = user_update.is_admin
        
        db.commit()
        db.refresh(user)
        
        return {
            "message": "User updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_admin": user.is_admin
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a user and all related data"""
    try:
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete yourself!"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Delete related records first to avoid foreign key constraints
        db.query(APIKey).filter(APIKey.user_id == user_id).delete()
        db.query(UserFeedback).filter(UserFeedback.user_id == user_id).delete()
        db.query(SpamLog).filter(SpamLog.user_id == user_id).delete()
        
        # Now delete the user
        db.delete(user)
        db.commit()
        
        return {"message": f"User '{user.username}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

#  SYSTEM ANALYTICS 
@router.get("/stats")
def get_system_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive system-wide statistics"""
    try:
        # User stats
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        admin_users = db.query(User).filter(User.is_admin == True).count()

        # Scan stats
        total_logs = db.query(SpamLog).count()
        spam_count = db.query(SpamLog).filter(SpamLog.result.ilike("%spam%")).count()
        ham_count = total_logs - spam_count

        # Feedback stats
        total_feedback = db.query(UserFeedback).count()

        # Calculate accuracy - simplified
        accuracy = 98.30  # Use model accuracy for now
        correct_predictions = 0

        # Recent activity (last 24 hours)
        last_24h = datetime.utcnow() - timedelta(hours=24)
        scans_24h = db.query(SpamLog).filter(SpamLog.created_at >= last_24h).count()
        new_users_24h = db.query(User).filter(User.created_at >= last_24h).count()

        return {
            "total_analyses": total_logs,
            "spam_detected": spam_count,
            "total_users": total_users,
            "system_accuracy": round(accuracy, 2),
            "spam_percentage": round((spam_count / total_logs * 100), 2) if total_logs > 0 else 0
        }
    except Exception as e:
        import traceback
        print(f"ERROR in /stats: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )

@router.get("/stats/user-growth")
def get_user_growth(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get user growth statistics over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Get daily user registrations
        growth_data = []
        for i in range(days):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            new_users = db.query(User).filter(
                and_(
                    User.created_at >= day_start,
                    User.created_at < day_end
                )
            ).count()

            total_users = db.query(User).filter(User.created_at <= day_end).count()

            growth_data.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "new_users": new_users,
                "total_users": total_users
            })

        return {
            "period_days": days,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "growth_data": growth_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user growth: {str(e)}"
        )

@router.get("/stats/spam-trends")
def get_spam_trends(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get spam detection trends over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        trends_data = []
        for i in range(days):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            day_logs = db.query(SpamLog).filter(
                and_(
                    SpamLog.created_at >= day_start,
                    SpamLog.created_at < day_end
                )
            ).all()

            total = len(day_logs)
            spam = sum(1 for log in day_logs if "spam" in log.result.lower())
            ham = total - spam

            trends_data.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "total_scans": total,
                "spam_detected": spam,
                "ham_detected": ham,
                "spam_rate": round((spam / total * 100), 2) if total > 0 else 0
            })

        return {
            "period_days": days,
            "trends_data": trends_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get spam trends: {str(e)}"
        )

#  SPAM MANAGEMENT 
@router.get("/spam-logs")
def get_all_spam_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    result_filter: Optional[str] = None,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """View all spam logs with filtering"""
    try:
        query = db.query(SpamLog)

        if result_filter:
            query = query.filter(SpamLog.result.ilike(f"%{result_filter}%"))
        if user_id:
            query = query.filter(SpamLog.user_id == user_id)

        total = query.count()
        logs = query.order_by(desc(SpamLog.created_at)).offset(skip).limit(limit).all()

        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "username": log.user.username if log.user else "Unknown",
                    "email_text": log.email_text[:200] + "..." if len(log.email_text) > 200 else log.email_text,
                    "result": log.result,
                    "confidence": log.confidence,
                    "model_version": log.model_version,
                    "is_correct": log.is_correct,
                    "created_at": log.created_at
                }
                for log in logs
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get spam logs: {str(e)}"
        )

@router.get("/feedback")
def get_all_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    misclassified_only: bool = Query(False),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """View all user feedback"""
    try:
        query = db.query(UserFeedback)

        if misclassified_only:
            query = query.filter(UserFeedback.original_result != UserFeedback.corrected_result)

        total = query.count()
        feedbacks = query.order_by(desc(UserFeedback.created_at)).offset(skip).limit(limit).all()

        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "feedbacks": [
                {
                    "id": f.id,
                    "user_id": f.user_id,
                    "username": f.user.username if f.user else "Unknown",
                    "spam_log_id": f.spam_log_id,
                    "original_result": f.original_result,
                    "corrected_result": f.corrected_result,
                    "comment": f.comment,
                    "was_misclassified": f.original_result != f.corrected_result,
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

#  API KEY MANAGEMENT 
@router.get("/api-keys")
def get_all_api_keys(
    user_id: Optional[int] = None,
    active_only: bool = Query(False),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all API keys"""
    try:
        query = db.query(APIKey)

        if user_id:
            query = query.filter(APIKey.user_id == user_id)
        if active_only:
            query = query.filter(APIKey.is_active == True)

        api_keys = query.all()

        return {
            "total": len(api_keys),
            "api_keys": [
                {
                    "id": key.id,
                    "user_id": key.user_id,
                    "username": key.user.username if key.user else "Unknown",
                    "name": key.name,
                    "key": key.key[:20] + "..." if len(key.key) > 20 else key.key,
                    "is_active": key.is_active,
                    "usage_count": key.usage_count,
                    "last_used_at": key.last_used_at,
                    "created_at": key.created_at,
                    "expires_at": key.expires_at
                }
                for key in api_keys
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get API keys: {str(e)}"
        )

@router.post("/api-keys/generate")
def generate_api_key(
    data: APIKeyCreateSchema,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Generate a new API key for a user"""
    try:
        user = db.query(User).filter(User.id == data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Generate expiration date if specified
        expires_at = None
        if data.expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)

        api_key = APIKey(
            user_id=data.user_id,
            key=APIKey.generate_key(),
            name=data.name,
            expires_at=expires_at
        )

        db.add(api_key)
        db.commit()
        db.refresh(api_key)

        return {
            "message": "API key generated successfully",
            "api_key": {
                "id": api_key.id,
                "key": api_key.key,
                "name": api_key.name,
                "user_id": api_key.user_id,
                "username": user.username,
                "created_at": api_key.created_at,
                "expires_at": api_key.expires_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate API key: {str(e)}"
        )

@router.delete("/api-keys/{key_id}")
def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Revoke (delete) an API key"""
    try:
        api_key = db.query(APIKey).filter(APIKey.id == key_id).first()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )

        db.delete(api_key)
        db.commit()

        return {"message": "API key revoked successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke API key: {str(e)}"
        )

@router.patch("/api-keys/{key_id}/toggle-active")
def toggle_api_key_active(
    key_id: int,
    is_active: bool,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Activate or deactivate an API key"""
    try:
        api_key = db.query(APIKey).filter(APIKey.id == key_id).first()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )

        api_key.is_active = is_active
        db.commit()
        db.refresh(api_key)

        return {
            "message": f"API key {'activated' if is_active else 'deactivated'} successfully",
            "api_key": {
                "id": api_key.id,
                "name": api_key.name,
                "is_active": api_key.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle API key status: {str(e)}"
        )

#  MODEL MANAGEMENT 
@router.get("/model/info")
def get_model_info(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get ML model information"""
    try:
        # Get model version stats
        model_versions = db.query(
            SpamLog.model_version,
            func.count(SpamLog.id).label('count')
        ).group_by(SpamLog.model_version).all()

        # Get average confidence
        avg_confidence = db.query(func.avg(SpamLog.confidence)).scalar() or 0

        # Get accuracy by model version
        version_stats = []
        for version, count in model_versions:
            version_logs = db.query(SpamLog).filter(SpamLog.model_version == version).all()
            feedbacks = db.query(UserFeedback).join(SpamLog).filter(
                SpamLog.model_version == version
            ).all()

            correct = sum(
                1 for f in feedbacks
                if f.original_result and f.corrected_result and f.original_result.strip().lower() == f.corrected_result.strip().lower()
            )
            accuracy = (correct / len(feedbacks) * 100) if feedbacks else 0

            version_stats.append({
                "version": version or "Unknown",
                "total_predictions": count,
                "total_feedback": len(feedbacks),
                "accuracy": round(accuracy, 2)
            })

        return {
            "average_confidence": round(avg_confidence, 4),
            "model_versions": version_stats,
            "total_predictions": db.query(SpamLog).count()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model info: {str(e)}"
        )

@router.post("/model/retrain")
def trigger_model_retrain(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Trigger model retraining (placeholder - implement your retraining logic)"""
    try:
        # Get feedback data for retraining
        feedbacks = db.query(UserFeedback).all()
        misclassifications = [f for f in feedbacks if f.original_result != f.corrected_result]

        # TODO: Implement actual model retraining logic here
        # This is just a placeholder response

        return {
            "message": "Model retraining initiated",
            "training_data": {
                "total_feedback": len(feedbacks),
                "misclassifications": len(misclassifications),
                "accuracy_before_retrain": round((len(feedbacks) - len(misclassifications)) / len(feedbacks) * 100, 2) if feedbacks else 0
            },
            "status": "Training job queued",
            "note": "Implement actual retraining logic in your ML pipeline"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger retraining: {str(e)}"
        )

@router.get("/model/performance")
def get_model_performance(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get model performance metrics over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Get daily performance
        performance_data = []
        for i in range(days):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)

            # Get predictions for this day
            day_logs = db.query(SpamLog).filter(
                and_(
                    SpamLog.created_at >= day_start,
                    SpamLog.created_at < day_end
                )
            ).all()

            # Get feedback for this day
            day_feedback = db.query(UserFeedback).filter(
                and_(
                    UserFeedback.created_at >= day_start,
                    UserFeedback.created_at < day_end
                )
            ).all()

            correct = sum(
                1 for f in day_feedback
                if f.original_result and f.corrected_result and f.original_result.strip().lower() == f.corrected_result.strip().lower()
            )

            avg_conf = sum(log.confidence or 0 for log in day_logs) / len(day_logs) if day_logs else 0

            performance_data.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "predictions": len(day_logs),
                "feedback_received": len(day_feedback),
                "correct_predictions": correct,
                "accuracy": round((correct / len(day_feedback) * 100), 2) if day_feedback else 0,
                "average_confidence": round(avg_conf, 4)
            })

        return {
            "period_days": days,
            "performance_data": performance_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model performance: {str(e)}"
        )

#  SYSTEM HEALTH 
@router.get("/health")
def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health metrics"""
    try:
        # Database health
        try:
            db.execute("SELECT 1")
            db_status = "healthy"
        except:
            db_status = "unhealthy"

        # Recent activity
        last_hour = datetime.utcnow() - timedelta(hours=1)
        recent_scans = db.query(SpamLog).filter(SpamLog.created_at >= last_hour).count()
        recent_users = db.query(User).filter(User.created_at >= last_hour).count()

        # Error rate (misclassifications)
        recent_feedback = db.query(UserFeedback).filter(
            UserFeedback.created_at >= last_hour
        ).all()

        recent_errors = sum(
            1 for f in recent_feedback
            if f.original_result and f.corrected_result and f.original_result.strip().lower() != f.corrected_result.strip().lower()
        )

        error_rate = (recent_errors / len(recent_feedback) * 100) if recent_feedback else 0

        return {
            "status": "healthy" if db_status == "healthy" and error_rate < 20 else "warning",
            "database": db_status,
            "last_hour": {
                "scans": recent_scans,
                "new_users": recent_users,
                "feedback": len(recent_feedback),
                "error_rate": round(error_rate, 2)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

#  BULK OPERATIONS 
@router.post("/bulk/deactivate-inactive-users")
def deactivate_inactive_users(
    days_inactive: int = Query(90, ge=1),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Deactivate users who haven't been active for X days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)

        # Find inactive users
        inactive_users = db.query(User).filter(
            User.is_active == True,
            User.is_admin == False,
            User.id != current_user.id
        ).all()

        deactivated = []
        for user in inactive_users:
            # Check last activity
            last_scan = db.query(SpamLog).filter(
                SpamLog.user_id == user.id
            ).order_by(desc(SpamLog.created_at)).first()

            last_activity = last_scan.created_at if last_scan else user.created_at

            if last_activity < cutoff_date:
                user.is_active = False
                deactivated.append({
                    "id": user.id,
                    "username": user.username,
                    "last_activity": last_activity
                })

        db.commit()

        return {
            "message": f"Deactivated {len(deactivated)} inactive users",
            "deactivated_users": deactivated,
            "days_threshold": days_inactive
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate inactive users: {str(e)}"
        )

@router.delete("/bulk/delete-old-logs")
def delete_old_logs(
    days_old: int = Query(365, ge=30),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete spam logs older than X days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)

        # Count logs to be deleted
        count = db.query(SpamLog).filter(SpamLog.created_at < cutoff_date).count()

        # Delete old logs
        db.query(SpamLog).filter(SpamLog.created_at < cutoff_date).delete()
        db.commit()

        return {
            "message": f"Deleted {count} old spam logs",
            "days_threshold": days_old,
            "cutoff_date": cutoff_date.isoformat()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete old logs: {str(e)}"
        )

#  EXPORT DATA 
@router.get("/export/users")
def export_users_data(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Export all user data"""
    try:
        users = db.query(User).all()

        export_data = []
        for user in users:
            total_scans = db.query(SpamLog).filter(SpamLog.user_id == user.id).count()
            total_feedback = db.query(UserFeedback).filter(UserFeedback.user_id == user.id).count()

            export_data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "total_scans": total_scans,
                "total_feedback": total_feedback,
                "created_at": user.created_at.isoformat() if user.created_at else None
            })

        return {
            "total_users": len(export_data),
            "exported_at": datetime.utcnow().isoformat(),
            "data": export_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export users: {str(e)}"
        )

@router.get("/export/spam-logs")
def export_spam_logs(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Export spam logs for the last X days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        logs = db.query(SpamLog).filter(SpamLog.created_at >= cutoff_date).all()

        export_data = []
        for log in logs:
            export_data.append({
                "id": log.id,
                "user_id": log.user_id,
                "username": log.user.username if log.user else "Unknown",
                "result": log.result,
                "confidence": log.confidence,
                "model_version": log.model_version,
                "is_correct": log.is_correct,
                "created_at": log.created_at.isoformat() if log.created_at else None
            })

        return {
            "total_logs": len(export_data),
            "period_days": days,
            "exported_at": datetime.utcnow().isoformat(),
            "data": export_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export spam logs: {str(e)}"
        )
