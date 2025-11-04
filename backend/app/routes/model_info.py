"""
Model information and management API routes
Provides endpoints for viewing model versions, storage info, and cleanup
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pathlib import Path
import pickle
import logging

from app.database import get_db
from app.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

class ModelVersionInfo(BaseModel):
    version: str
    accuracy: float
    trained_at: str
    retrained: bool
    algorithm: str
    file_size_kb: float
    features_count: int
    metrics: Optional[Dict[str, Any]] = None
    vectorizer_type: Optional[str] = None

class StorageInfo(BaseModel):
    total_models: int
    total_size_mb: float
    oldest_model: Optional[str] = None
    oldest_date: Optional[str] = None
    newest_model: Optional[str] = None
    newest_date: Optional[str] = None
    directory_exists: bool
    average_size_mb: Optional[float] = None

class CleanupResponse(BaseModel):
    message: str
    success: bool
    deleted: int
    freed_mb: float
    kept: Optional[int] = None
    deleted_files: Optional[List[str]] = None

@router.get("/versions", response_model=Dict[str, Any])
def get_all_model_versions(
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get information about all model versions
    Requires admin authentication
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return {
                "total_models": 0,
                "models": [],
                "message": "No models directory found"
            }
        
        model_files = sorted(
            ml_models_path.glob('spam_model_v*.pkl'),
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )
        
        if not model_files:
            return {
                "total_models": 0,
                "models": [],
                "message": "No model versions found"
            }
        
        models_info = []
        
        for model_file in model_files:
            try:
                with open(model_file, 'rb') as f:
                    metadata = pickle.load(f)
                
                models_info.append({
                    'version': metadata.get('version', 'unknown'),
                    'accuracy': float(metadata.get('accuracy', 0)),
                    'metrics': metadata.get('metrics', {}),
                    'trained_at': metadata.get('trained_at', 'unknown'),
                    'retrained': metadata.get('retrained', False),
                    'algorithm': metadata.get('algorithm', 'unknown'),
                    'file_size_kb': round(model_file.stat().st_size / 1024, 2),
                    'features_count': metadata.get('features_count', 0),
                    'vectorizer_type': metadata.get('vectorizer_type', 'unknown')
                })
            except Exception as e:
                logger.warning(f"Could not read {model_file.name}: {e}")
                continue
        
        return {
            "total_models": len(models_info),
            "models": models_info,
            "message": f"Found {len(models_info)} model versions"
        }
        
    except Exception as e:
        logger.error(f"Error getting model versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/storage", response_model=StorageInfo)
def get_storage_info(
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get model storage information
    Requires admin authentication
    """
    try:
        from app.utils.model_cleanup import get_model_storage_info
        return get_model_storage_info()
    except Exception as e:
        logger.error(f"Error getting storage info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/current")
def get_current_model_info(
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get information about the currently active model
    Requires admin authentication
    """
    try:
        model_path = Path('ml_models/spam_model.pkl')
        
        if not model_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active model found"
            )
        
        with open(model_path, 'rb') as f:
            metadata = pickle.load(f)
        
        return {
            'version': metadata.get('version', 'unknown'),
            'accuracy': float(metadata.get('accuracy', 0)),
            'metrics': metadata.get('metrics', {}),
            'trained_at': metadata.get('trained_at', 'unknown'),
            'retrained': metadata.get('retrained', False),
            'algorithm': metadata.get('algorithm', 'unknown'),
            'features_count': metadata.get('features_count', 0),
            'vectorizer_type': metadata.get('vectorizer_type', 'unknown'),
            'file_size_kb': round(model_path.stat().st_size / 1024, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/cleanup", response_model=CleanupResponse)
def cleanup_old_models_endpoint(
    keep_latest: int = 10,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Manually trigger model cleanup
    Deletes old model versions, keeping only the most recent ones
    Requires admin authentication
    
    Args:
        keep_latest: Number of recent models to keep (default: 10)
    """
    try:
        if keep_latest < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="keep_latest must be at least 1"
            )
        
        if keep_latest > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="keep_latest cannot exceed 50"
            )
        
        from app.utils.model_cleanup import cleanup_old_models
        result = cleanup_old_models(keep_latest=keep_latest)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('error', 'Cleanup failed')
            )
        
        return CleanupResponse(
            message=f"Cleanup complete, kept {keep_latest} most recent models",
            success=True,
            deleted=result['deleted'],
            freed_mb=result['freed_mb'],
            kept=result.get('kept', keep_latest),
            deleted_files=result.get('deleted_files', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/version/{version}")
def delete_model_version(
    version: str,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a specific model version
    Cannot delete the currently active model
    Requires admin authentication
    
    Args:
        version: Model version to delete (e.g., "1.0", "2.5")
    """
    try:
        from app.utils.model_cleanup import delete_specific_model
        result = delete_specific_model(version)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Deletion failed')
            )
        
        return {
            'message': f"Model version {version} deleted successfully",
            'success': True,
            'version': version,
            'freed_kb': result.get('freed_kb', 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete version failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/compare")
def compare_models(
    versions: Optional[List[str]] = None,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Compare multiple model versions
    If no versions specified, compares the 5 most recent models
    Requires admin authentication
    
    Args:
        versions: List of version strings to compare
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return {
                'models': [],
                'message': 'No models directory found'
            }
        
        if versions:
            # Compare specific versions
            model_files = [ml_models_path / f'spam_model_v{v}.pkl' for v in versions]
            model_files = [f for f in model_files if f.exists()]
        else:
            # Compare 5 most recent
            model_files = sorted(
                ml_models_path.glob('spam_model_v*.pkl'),
                key=lambda f: f.stat().st_mtime,
                reverse=True
            )[:5]
        
        if not model_files:
            return {
                'models': [],
                'message': 'No models found for comparison'
            }
        
        comparison = []
        
        for model_file in model_files:
            try:
                with open(model_file, 'rb') as f:
                    metadata = pickle.load(f)
                
                metrics = metadata.get('metrics', {})
                
                comparison.append({
                    'version': metadata.get('version', 'unknown'),
                    'accuracy': float(metadata.get('accuracy', 0)),
                    'precision': float(metrics.get('precision', 0)),
                    'recall': float(metrics.get('recall', 0)),
                    'f1_score': float(metrics.get('f1_score', 0)),
                    'roc_auc': float(metrics.get('roc_auc', 0)),
                    'trained_at': metadata.get('trained_at', 'unknown'),
                    'retrained': metadata.get('retrained', False),
                    'features_count': metadata.get('features_count', 0)
                })
            except Exception as e:
                logger.warning(f"Could not read {model_file.name}: {e}")
                continue
        
        # Sort by version descending
        comparison.sort(key=lambda x: float(x['version']), reverse=True)
        
        return {
            'models': comparison,
            'total_compared': len(comparison),
            'message': f'Comparing {len(comparison)} models'
        }
        
    except Exception as e:
        logger.error(f"Error comparing models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )