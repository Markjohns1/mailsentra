"""
Model version cleanup and management utility
Handles old model deletion and storage information
"""

import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

def cleanup_old_models(keep_latest=5):
    """
    Keep only the N most recent model versions
    
    Args:
        keep_latest: Number of recent versions to keep (default: 5)
    
    Returns:
        dict: Statistics about cleanup operation
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return {
                'success': True,
                'message': 'ml_models directory does not exist',
                'deleted': 0,
                'freed_mb': 0
            }
        
        # Get all versioned model files sorted by modification time
        model_files = sorted(
            ml_models_path.glob('spam_model_v*.pkl'),
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )
        
        if len(model_files) <= keep_latest:
            logger.info(f"Only {len(model_files)} models exist, no cleanup needed")
            return {
                'success': True,
                'message': f'Only {len(model_files)} models exist',
                'deleted': 0,
                'freed_mb': 0
            }
        
        # Keep the latest N, delete the rest
        files_to_delete = model_files[keep_latest:]
        deleted_count = 0
        freed_space = 0
        deleted_files = []
        
        for file_path in files_to_delete:
            try:
                file_size = file_path.stat().st_size
                file_path.unlink()
                deleted_count += 1
                freed_space += file_size
                deleted_files.append(file_path.name)
                logger.info(f"Deleted old model: {file_path.name}")
            except Exception as e:
                logger.warning(f"Could not delete {file_path.name}: {e}")
        
        freed_mb = freed_space / (1024 * 1024)
        logger.info(f"Cleanup complete: {deleted_count} models deleted, {freed_mb:.2f} MB freed")
        logger.info(f"Keeping {keep_latest} most recent models")
        
        return {
            'success': True,
            'deleted': deleted_count,
            'freed_mb': round(freed_mb, 2),
            'kept': keep_latest,
            'deleted_files': deleted_files
        }
        
    except Exception as e:
        logger.error(f"Model cleanup failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'deleted': 0,
            'freed_mb': 0
        }

def get_model_storage_info():
    """
    Get information about model storage
    
    Returns:
        dict: Storage statistics
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return {
                'total_models': 0,
                'total_size_mb': 0,
                'oldest_model': None,
                'newest_model': None,
                'directory_exists': False
            }
        
        model_files = list(ml_models_path.glob('spam_model_v*.pkl'))
        
        if not model_files:
            return {
                'total_models': 0,
                'total_size_mb': 0,
                'oldest_model': None,
                'newest_model': None,
                'directory_exists': True
            }
        
        total_size = sum(f.stat().st_size for f in model_files)
        
        oldest = min(model_files, key=lambda f: f.stat().st_mtime)
        newest = max(model_files, key=lambda f: f.stat().st_mtime)
        
        return {
            'total_models': len(model_files),
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'oldest_model': oldest.name,
            'oldest_date': datetime.fromtimestamp(oldest.stat().st_mtime).isoformat(),
            'newest_model': newest.name,
            'newest_date': datetime.fromtimestamp(newest.stat().st_mtime).isoformat(),
            'directory_exists': True,
            'average_size_mb': round((total_size / len(model_files)) / (1024 * 1024), 2)
        }
        
    except Exception as e:
        logger.error(f"Error getting storage info: {e}")
        return {
            'error': str(e),
            'total_models': 0,
            'total_size_mb': 0
        }

def list_all_models():
    """
    List all model versions with their metadata
    
    Returns:
        list: List of model information dictionaries
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return []
        
        model_files = sorted(
            ml_models_path.glob('spam_model_v*.pkl'),
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )
        
        models_info = []
        
        for model_file in model_files:
            try:
                stat = model_file.stat()
                models_info.append({
                    'filename': model_file.name,
                    'size_kb': round(stat.st_size / 1024, 2),
                    'modified_date': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'version': model_file.stem.split('_v')[1] if '_v' in model_file.stem else 'unknown'
                })
            except Exception as e:
                logger.warning(f"Could not read info for {model_file.name}: {e}")
                continue
        
        return models_info
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        return []

def delete_specific_model(version):
    """
    Delete a specific model version
    
    Args:
        version: Version string (e.g., "1.0", "2.5")
    
    Returns:
        dict: Result of deletion operation
    """
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return {
                'success': False,
                'error': 'ml_models directory does not exist'
            }
        
        model_path = ml_models_path / f'spam_model_v{version}.pkl'
        
        if not model_path.exists():
            return {
                'success': False,
                'error': f'Model version {version} not found'
            }
        
        # Prevent deletion of current model
        current_model = ml_models_path / 'spam_model.pkl'
        if current_model.exists():
            import pickle
            try:
                with open(current_model, 'rb') as f:
                    metadata = pickle.load(f)
                    current_version = metadata.get('version', 'unknown')
                    
                if current_version == version:
                    return {
                        'success': False,
                        'error': f'Cannot delete current active model version {version}'
                    }
            except:
                pass
        
        file_size = model_path.stat().st_size
        model_path.unlink()
        
        logger.info(f"Deleted model version {version}")
        
        return {
            'success': True,
            'version': version,
            'freed_kb': round(file_size / 1024, 2)
        }
        
    except Exception as e:
        logger.error(f"Error deleting model version {version}: {e}")
        return {
            'success': False,
            'error': str(e)
        }