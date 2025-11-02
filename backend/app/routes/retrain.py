from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import logging
import sys
import os
from pathlib import Path
import pandas as pd

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

@router.get("/status", response_model=RetrainStatusResponse)
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

@router.post("/upload-dataset", response_model=Dict[str, Any])
def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload a CSV dataset file for training"""
    try:
        logger.info(f"Dataset upload request from admin {current_user.username}")
        
        # Validate file extension
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported"
            )
        
        # Create dataset directory if it doesn't exist
        dataset_dir = Path("dataset")
        dataset_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = dataset_dir / f"uploaded_{timestamp}_{file.filename}"
        
        with open(file_path, "wb") as f:
            content = file.file.read()
            f.write(content)
        
        # Validate CSV structure
        try:
            df = pd.read_csv(file_path)
            
            # Check required columns
            required_columns = ['label', 'message'] if 'message' in df.columns else ['label', 'text']
            if 'label' not in df.columns:
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CSV must have 'label' column. Expected columns: ['label', 'message'] or ['label', 'text']"
                )
            
            text_col = 'message' if 'message' in df.columns else 'text'
            if text_col not in df.columns:
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"CSV must have '{text_col}' column"
                )
            
            # Validate labels
            valid_labels = {'spam', 'ham'}
            df['label'] = df['label'].str.lower().str.strip()
            invalid_labels = set(df['label'].unique()) - valid_labels
            if invalid_labels:
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid labels found: {invalid_labels}. Labels must be 'spam' or 'ham'"
                )
            
            # Get statistics
            spam_count = (df['label'] == 'spam').sum()
            ham_count = (df['label'] == 'ham').sum()
            total_count = len(df)
            
            logger.info(f"Dataset uploaded successfully: {total_count} samples ({spam_count} spam, {ham_count} ham)")
            
            return {
                "message": "Dataset uploaded successfully",
                "file_path": str(file_path),
                "filename": file.filename,
                "total_samples": total_count,
                "spam_samples": int(spam_count),
                "ham_samples": int(ham_count),
                "uploaded_at": datetime.now().isoformat()
            }
            
        except pd.errors.EmptyDataError:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file is empty"
            )
        except pd.errors.ParserError as e:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid CSV format: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dataset upload failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset upload failed: {str(e)}"
        )

class TrainRequest(BaseModel):
    dataset_path: Optional[str] = None

@router.post("/train", response_model=RetrainResponse)
def train_initial_model(
    request: TrainRequest = TrainRequest(),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Train model from scratch using a dataset (default: SMS Spam Collection)"""
    try:
        logger.info(f"Initial training request initiated by admin {current_user.username}")
        
        dataset_path = request.dataset_path if request else None
        
        if dataset_path:
            logger.info(f"Using custom dataset: {dataset_path}")
            # Validate path exists
            if not Path(dataset_path).exists():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Dataset file not found: {dataset_path}"
                )
        
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from train_model import main as train_main, load_dataset, preprocess_dataset, train_model, save_model, get_next_version
        
        if dataset_path:
            # Use custom dataset
            df = load_dataset(dataset_path)
            df = preprocess_dataset(df)
            model, vectorizer, accuracy = train_model(df)
            model_path, version = save_model(model, vectorizer, accuracy, retrained=False)
            training_samples = len(df)
        else:
            # Use default dataset
            train_main()
            training_samples = 5574
        
        from app.services.model_service import spam_model
        spam_model.load_model()

        logger.info(f"Model trained successfully")

        return RetrainResponse(
            message="Model trained successfully from dataset",
            success=True,
            training_stats={
                "accuracy": spam_model.metadata.get('accuracy', 0),
                "version": str(spam_model.metadata.get('version', 'unknown')),
                "training_samples": training_samples,
                "trained_at": datetime.now().isoformat(),
                "retrained": False,
                "dataset_path": dataset_path or "default"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )

@router.post("", response_model=RetrainResponse)
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
        missing_logs = 0
        empty_texts = 0
        
        for feedback in feedbacks:
            spam_log = db.query(SpamLog).filter(
                SpamLog.id == feedback.spam_log_id
            ).first()

            if not spam_log:
                missing_logs += 1
                logger.warning(f"Spam log {feedback.spam_log_id} not found for feedback {feedback.id}")
                continue
                
            if not spam_log.email_text or spam_log.email_text.strip() == "":
                empty_texts += 1
                logger.warning(f"Spam log {feedback.spam_log_id} has empty email_text")
                continue
                
            # Validate corrected_result
            corrected = feedback.corrected_result.lower().strip()
            if corrected not in ['spam', 'ham']:
                logger.warning(f"Invalid corrected_result '{feedback.corrected_result}' for feedback {feedback.id}")
                continue

            training_data.append({
                'text': spam_log.email_text,
                'label': corrected
            })

        if missing_logs > 0 or empty_texts > 0:
            logger.warning(f"Found {missing_logs} missing logs and {empty_texts} empty texts")

        if not training_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No valid training data found. Missing logs: {missing_logs}, Empty texts: {empty_texts}, Total feedback: {len(feedbacks)}"
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
