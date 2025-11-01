from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime, timedelta
import logging

from app.database import get_db
from app.models.spam_log import SpamLog
from app.models.user import User
from app.models.use_feedback import UserFeedback
from app.dependencies import get_current_admin_user

router = APIRouter()
logger = logging.getLogger(__name__)

class MetricsResponse(BaseModel):
    total_scans: int
    spam_detected: int
    ham_detected: int
    accuracy_rate: float
    spam_percentage: float
    total_users: int
    feedback_count: int
    model_version: str
    last_updated: str

class AnalyticsResponse(BaseModel):
    daily_stats: List[Dict[str, Any]]
    spam_rate_trend: List[Dict[str, Any]]
    user_activity: List[Dict[str, Any]]

@router.get("/metrics", response_model=MetricsResponse)
def get_system_metrics(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system-wide analytics and metrics"""
    try:
        logger.info(f"Metrics requested by admin {current_user.username}")

        total_scans = db.query(SpamLog).count()

        spam_count = db.query(SpamLog).filter(SpamLog.result.ilike("%spam%")).count()
        ham_count = total_scans - spam_count

        spam_percentage = (spam_count / total_scans * 100) if total_scans > 0 else 0

        feedback_count = db.query(UserFeedback).count()
        accurate_feedbacks = db.query(UserFeedback).filter(
            db.query(SpamLog).filter(
                SpamLog.id == UserFeedback.spam_log_id,
                SpamLog.is_correct == True
            ).exists()
        ).count()

        accuracy_rate = (accurate_feedbacks / feedback_count * 100) if feedback_count > 0 else 0

        total_users = db.query(User).count()

        try:
            from app.services.model_service import spam_model
            model_info = spam_model.get_model_info()
            model_version = model_info.get('version', 'unknown')
        except:
            model_version = 'unknown'

        return MetricsResponse(
            total_scans=total_scans,
            spam_detected=spam_count,
            ham_detected=ham_count,
            accuracy_rate=round(accuracy_rate, 2),
            spam_percentage=round(spam_percentage, 2),
            total_users=total_users,
            feedback_count=feedback_count,
            model_version=model_version,
            last_updated=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve metrics: {str(e)}"
        )

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for the specified time period"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        logs = db.query(SpamLog).filter(
            SpamLog.created_at >= start_date,
            SpamLog.created_at <= end_date
        ).all()

        daily_stats = {}
        spam_rate_trend = []

        for log in logs:
            date_key = log.created_at.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {'scans': 0, 'spam': 0, 'ham': 0}

            daily_stats[date_key]['scans'] += 1
            if 'spam' in log.result.lower():
                daily_stats[date_key]['spam'] += 1
            else:
                daily_stats[date_key]['ham'] += 1

        daily_stats_list = []
        for date, stats in sorted(daily_stats.items()):
            spam_rate = (stats['spam'] / stats['scans'] * 100) if stats['scans'] > 0 else 0
            daily_stats_list.append({
                'date': date,
                'scans': stats['scans'],
                'spam': stats['spam'],
                'ham': stats['ham'],
                'spam_rate': round(spam_rate, 2)
            })

            spam_rate_trend.append({
                'date': date,
                'rate': round(spam_rate, 2)
            })

        users = db.query(User).all()
        user_activity = []
        for user in users:
            user_logs_count = db.query(SpamLog).filter(SpamLog.user_id == user.id).count()
            user_feedback_count = db.query(UserFeedback).filter(UserFeedback.user_id == user.id).count()

            user_activity.append({
                'user_id': user.id,
                'username': user.username,
                'total_scans': user_logs_count,
                'feedback_count': user_feedback_count,
                'registration_date': user.created_at.isoformat() if user.created_at else None
            })

        return AnalyticsResponse(
            daily_stats=daily_stats_list,
            spam_rate_trend=spam_rate_trend,
            user_activity=user_activity
        )

    except Exception as e:
        logger.error(f"Failed to get analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )
