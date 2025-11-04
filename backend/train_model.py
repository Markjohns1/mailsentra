"""
Spam Detection Model Training Script
Trains a Naive Bayes classifier on SMS Spam Collection dataset
Supports both initial training and retraining from user feedback
"""

import pandas as pd
import pickle
import logging
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_recall_fscore_support, roc_auc_score, matthews_corrcoef
)
from app.services.preprocessing import email_preprocessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def download_dataset():
    """
    Download SMS Spam Collection dataset
    Dataset: https://archive.ics.uci.edu/ml/datasets/SMS+Spam+Collection
    """
    logger.info("Downloading spam dataset...")

    try:
        # URL for SMS Spam Collection
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00228/smsspamcollection.zip"

        import urllib.request
        import zipfile
        import os

        # Download
        urllib.request.urlretrieve(url, "smsspamcollection.zip")
        logger.info("Dataset downloaded")

        # Extract
        with zipfile.ZipFile("smsspamcollection.zip", 'r') as zip_ref:
            zip_ref.extractall("dataset")
        logger.info("Dataset extracted")

        # Clean up
        os.remove("smsspamcollection.zip")

        return "dataset/SMSSpamCollection"

    except Exception as e:
        logger.error(f"Error downloading dataset: {e}")
        logger.info("Creating sample dataset instead...")
        return create_sample_dataset()

def create_sample_dataset():
    """Create a sample dataset for testing if download fails"""
    sample_data = {
        'label': ['spam', 'ham', 'spam', 'ham', 'spam', 'ham', 'spam', 'ham'] * 50,
        'message': [
            'FREE! Click here to win $1000 now!!!',
            'Hey, how are you doing today?',
            'URGENT! Your account needs verification. Click link.',
            'Thanks for the help yesterday, really appreciate it',
            'Congratulations! You won a FREE iPhone. Claim now! Just click the button below and win!',
            'See you at the meeting tomorrow at 3pm',
            'Limited time offer! Buy now and get 90% discount!!!',
            'Just finished work, heading home soon'
        ] * 50
    }

    df = pd.DataFrame(sample_data)
    df.to_csv('dataset/sample_spam.csv', index=False)
    logger.info("Sample dataset created")
    return 'dataset/sample_spam.csv'

def load_dataset(filepath):
    """Load and prepare the spam dataset"""
    logger.info(f"Loading dataset from {filepath}")

    try:
        if 'SMSSpamCollection' in filepath and Path(filepath).exists():
            # Original dataset format (tab-separated, no header)
            df = pd.read_csv(filepath, sep='\t', names=['label', 'message'])
        elif filepath.endswith('.csv'):
            # CSV format - try different formats
            try:
                # Try with header first
                df = pd.read_csv(filepath)
                # Normalize column names
                if 'text' in df.columns and 'message' not in df.columns:
                    df = df.rename(columns={'text': 'message'})
                if 'label' not in df.columns:
                    raise ValueError("CSV must have 'label' column")
                if 'message' not in df.columns:
                    raise ValueError("CSV must have 'message' or 'text' column")
            except pd.errors.EmptyDataError:
                raise ValueError("CSV file is empty")
        else:
            # Sample dataset format
            df = pd.read_csv(filepath)

        # Normalize labels
        df['label'] = df['label'].str.lower().str.strip()
        df['label'] = df['label'].replace('not spam', 'ham')

        # Validate labels
        valid_labels = {'spam', 'ham'}
        invalid_labels = set(df['label'].unique()) - valid_labels
        if invalid_labels:
            raise ValueError(f"Invalid labels found: {invalid_labels}. Labels must be 'spam' or 'ham'")

        logger.info(f"Loaded {len(df)} messages")
        logger.info(f"   - Spam: {(df['label'] == 'spam').sum()}")
        logger.info(f"   - Ham: {(df['label'] == 'ham').sum()}")

        return df

    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise

def preprocess_dataset(df):
    """Preprocess all messages in the dataset"""
    logger.info("Preprocessing messages...")

    processed_messages = []
    for message in df['message']:
        result = email_preprocessor.preprocess_email(message, return_steps=False)
        processed_messages.append(result['final_processed_text'])

    df['processed_message'] = processed_messages
    logger.info("Preprocessing complete")

    return df

def calculate_detailed_metrics(y_test, y_pred, y_proba):
    """Calculate comprehensive model performance metrics"""
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='weighted', zero_division=0
    )
    
    # Convert labels to binary for ROC AUC
    y_test_binary = (y_test == 'spam').astype(int)
    
    return {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'roc_auc': float(roc_auc_score(y_test_binary, y_proba)),
        'mcc': float(matthews_corrcoef(y_test, y_pred)),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
    }

def train_model(df, test_size=0.2, cv_folds=5):
    """Train Naive Bayes classifier with cross-validation"""
    logger.info("Training Naive Bayes model with cross-validation...")

    # Prepare data
    X = df['processed_message']
    y = df['label']

    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    logger.info(f"   - Training samples: {len(X_train)}")
    logger.info(f"   - Testing samples: {len(X_test)}")

    # Use TF-IDF vectorization with bigrams
    vectorizer = TfidfVectorizer(
        max_features=3000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train Naive Bayes classifier with alpha parameter
    model = MultinomialNB(alpha=0.1)
    
    # Perform cross-validation on training set
    logger.info(f"Performing {cv_folds}-fold cross-validation...")
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_train_vec, y_train, cv=cv, scoring='f1_weighted')
    
    logger.info(f"   - CV F1-Score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Train on full training set
    model.fit(X_train_vec, y_train)

    # Make predictions
    y_pred = model.predict(X_test_vec)
    y_proba = model.predict_proba(X_test_vec)[:, 1]

    # Calculate comprehensive metrics
    metrics = calculate_detailed_metrics(y_test, y_pred, y_proba)
    metrics['cv_mean'] = float(cv_scores.mean())
    metrics['cv_std'] = float(cv_scores.std())

    logger.info("Model trained successfully!")
    logger.info(f"   - Test Accuracy: {metrics['accuracy'] * 100:.2f}%")
    logger.info(f"   - CV F1-Score: {metrics['cv_mean'] * 100:.2f}% (+/- {metrics['cv_std'] * 100:.2f}%)")
    logger.info(f"   - Precision: {metrics['precision'] * 100:.2f}%")
    logger.info(f"   - Recall: {metrics['recall'] * 100:.2f}%")
    logger.info(f"   - F1-Score: {metrics['f1_score'] * 100:.2f}%")
    logger.info(f"   - ROC-AUC: {metrics['roc_auc'] * 100:.2f}%")
    logger.info(f"   - MCC: {metrics['mcc']:.4f}")

    # Detailed metrics
    logger.info("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    logger.info("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return model, vectorizer, metrics

def get_next_version():
    """Get the next model version number"""
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return 1.0

        model_files = list(ml_models_path.glob('spam_model_v*.pkl'))
        if not model_files:
            return 1.0

        versions = []
        for f in model_files:
            try:
                version_str = f.stem.split('_v')[1]
                versions.append(float(version_str))
            except:
                pass

        return max(versions) + 0.1 if versions else 1.0
    except:
        return 1.0

def cleanup_old_models(keep_latest=10):
    """Keep only the N most recent model versions"""
    try:
        ml_models_path = Path('ml_models')
        if not ml_models_path.exists():
            return
        
        # Get all versioned model files sorted by modification time
        model_files = sorted(
            ml_models_path.glob('spam_model_v*.pkl'),
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )
        
        if len(model_files) <= keep_latest:
            logger.info(f"Only {len(model_files)} models exist, no cleanup needed")
            return
        
        # Delete old versions
        files_to_delete = model_files[keep_latest:]
        deleted_count = 0
        freed_space = 0
        
        for file_path in files_to_delete:
            try:
                file_size = file_path.stat().st_size
                file_path.unlink()
                deleted_count += 1
                freed_space += file_size
                logger.info(f"Deleted old model: {file_path.name}")
            except Exception as e:
                logger.warning(f"Could not delete {file_path.name}: {e}")
        
        freed_mb = freed_space / (1024 * 1024)
        logger.info(f"Cleanup complete: {deleted_count} models deleted, {freed_mb:.2f} MB freed")
        logger.info(f"Keeping {keep_latest} most recent models")
        
    except Exception as e:
        logger.error(f"Model cleanup failed: {e}")

def save_model(model, vectorizer, metrics, version=None, retrained=False):
    """Save trained model with comprehensive metrics"""
    logger.info("Saving model...")

    import os
    os.makedirs('ml_models', exist_ok=True)

    # Determine version
    if version is None:
        version = get_next_version()

    version_str = f"{version:.1f}"

    # Extract accuracy for backward compatibility
    accuracy = metrics if isinstance(metrics, float) else metrics.get('accuracy', 0)

    # Model metadata with full metrics
    metadata = {
        'model': model,
        'vectorizer': vectorizer,
        'accuracy': accuracy,
        'metrics': metrics if isinstance(metrics, dict) else {'accuracy': accuracy},
        'version': version_str,
        'trained_at': datetime.now().isoformat(),
        'algorithm': 'Multinomial Naive Bayes',
        'retrained': retrained,
        'vectorizer_type': type(vectorizer).__name__,
        'features_count': len(vectorizer.get_feature_names_out()) if hasattr(vectorizer, 'get_feature_names_out') else 0
    }

    # Save model with version
    model_path = f'ml_models/spam_model_v{version_str}.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(metadata, f)

    # Also save as latest for easy loading
    latest_path = 'ml_models/spam_model.pkl'
    with open(latest_path, 'wb') as f:
        pickle.dump(metadata, f)

    logger.info(f"Model saved to {model_path}")
    logger.info(f"   - Version: {version_str}")
    logger.info(f"   - Accuracy: {accuracy * 100:.2f}%")
    if isinstance(metrics, dict):
        logger.info(f"   - F1-Score: {metrics.get('f1_score', 0) * 100:.2f}%")
        logger.info(f"   - ROC-AUC: {metrics.get('roc_auc', 0) * 100:.2f}%")
    logger.info(f"   - Retrained: {retrained}")
    
    # Cleanup old models
    try:
        cleanup_old_models(keep_latest=10)
    except Exception as e:
        logger.warning(f"Model cleanup failed: {e}")

    return model_path, version_str

def train_model_from_data(training_data, test_size=0.2):
    """
    Train model from custom training data (for retraining from feedback)
    Combines feedback samples with original dataset to prevent catastrophic forgetting

    Args:
        training_data: List of dicts with 'text' and 'label' keys
        test_size: Proportion for test set

    Returns:
        Tuple of (accuracy, version_str)
    """
    logger.info(f"Retraining model with {len(training_data)} feedback samples...")

    try:
        # Validate feedback data
        feedback_df = pd.DataFrame(training_data)

        # Validate labels
        valid_labels = {'spam', 'ham', 'not spam'}
        feedback_df['label'] = feedback_df['label'].str.lower().str.strip()
        feedback_df['label'] = feedback_df['label'].replace('not spam', 'ham')

        invalid_labels = set(feedback_df['label'].unique()) - valid_labels
        if invalid_labels:
            raise ValueError(f"Invalid labels found: {invalid_labels}. Must be 'spam' or 'ham'")

        # Log class distribution
        logger.info("Feedback class distribution:")
        for label, count in feedback_df['label'].value_counts().items():
            logger.info(f"   - {label}: {count} samples")

        # Load original dataset to combine with feedback
        logger.info("Loading original dataset to prevent catastrophic forgetting...")
        try:
            dataset_path = "dataset/SMSSpamCollection"
            if not Path(dataset_path).exists():
                logger.warning("Original dataset not found, downloading...")
                dataset_path = download_dataset()

            base_df = load_dataset(dataset_path)
            logger.info(f"Loaded {len(base_df)} samples from base dataset")

            # Rename column to match feedback format
            base_df = base_df.rename(columns={'message': 'text'})

            # Combine base dataset with feedback
            combined_df = pd.concat([base_df, feedback_df[['text', 'label']]], ignore_index=True)
            logger.info(f"Combined dataset: {len(combined_df)} total samples")
            logger.info(f"   - Base: {len(base_df)}, Feedback: {len(feedback_df)}")

        except Exception as e:
            logger.warning(f"Could not load base dataset: {e}")
            logger.warning("Training only on feedback (risk of catastrophic forgetting)")
            combined_df = feedback_df

        # Log final class distribution
        logger.info("Final training class distribution:")
        for label, count in combined_df['label'].value_counts().items():
            logger.info(f"   - {label}: {count} samples")

        # Check for class imbalance
        min_class_samples = combined_df['label'].value_counts().min()
        if min_class_samples < 2:
            logger.warning(f"Minimum class has only {min_class_samples} sample(s)")
            logger.warning("Disabling stratification to prevent errors")
            use_stratify = False
        else:
            use_stratify = True

        # Preprocess combined data
        logger.info("Preprocessing combined dataset...")
        processed_messages = []
        for message in combined_df['text']:
            result = email_preprocessor.preprocess_email(message, return_steps=False)
            processed_messages.append(result['final_processed_text'])

        combined_df['processed_message'] = processed_messages

        # Train model
        X = combined_df['processed_message']
        y = combined_df['label']

        # Split with or without stratification
        if use_stratify:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, stratify=y
            )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

        logger.info(f"   - Training samples: {len(X_train)}")
        logger.info(f"   - Testing samples: {len(X_test)}")

        # Vectorize with TF-IDF
        vectorizer = TfidfVectorizer(
            max_features=3000,
            ngram_range=(1, 2),
            min_df=2,
            sublinear_tf=True
        )
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)

        # Train model
        model = MultinomialNB(alpha=0.1)
        model.fit(X_train_vec, y_train)

        # Evaluate
        y_pred = model.predict(X_test_vec)
        y_proba = model.predict_proba(X_test_vec)[:, 1]
        
        metrics = calculate_detailed_metrics(y_test, y_pred, y_proba)

        logger.info("Model retrained successfully!")
        logger.info(f"   - Accuracy: {metrics['accuracy'] * 100:.2f}%")
        logger.info(f"   - F1-Score: {metrics['f1_score'] * 100:.2f}%")
        logger.info(f"   - Precision: {metrics['precision'] * 100:.2f}%")
        logger.info(f"   - Recall: {metrics['recall'] * 100:.2f}%")
        logger.info("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        # Save with new version
        model_path, version = save_model(model, vectorizer, metrics, retrained=True)

        logger.info(f"Retraining complete! New version: {version}, Accuracy: {metrics['accuracy'] * 100:.2f}%")
        return metrics['accuracy'], version

    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        raise

def main(dataset_path=None):
    """
    Main training pipeline

    Args:
        dataset_path: Optional path to dataset file. If None, downloads default dataset.
    """
    logger.info("=" * 60)
    logger.info("Starting Spam Detection Model Training")
    logger.info("=" * 60)

    try:
        # Step 1: Get dataset path
        if dataset_path:
            logger.info(f"Using custom dataset: {dataset_path}")
            if not Path(dataset_path).exists():
                raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
        else:
            # Download default dataset
            dataset_path = download_dataset()

        # Step 2: Load dataset
        df = load_dataset(dataset_path)

        # Step 3: Preprocess dataset
        df = preprocess_dataset(df)

        # Step 4: Train model with cross-validation
        model, vectorizer, metrics = train_model(df)

        # Step 5: Save model
        model_path, version = save_model(model, vectorizer, metrics)

        logger.info("=" * 60)
        logger.info("Training Complete!")
        logger.info(f"   Model saved at: {model_path}")
        logger.info(f"   Accuracy: {metrics['accuracy'] * 100:.2f}%")
        logger.info(f"   F1-Score: {metrics['f1_score'] * 100:.2f}%")
        logger.info(f"   Version: {version}")
        logger.info(f"   Dataset: {dataset_path}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()