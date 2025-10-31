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
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
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
        logger.info("✅ Dataset downloaded")

        # Extract
        with zipfile.ZipFile("smsspamcollection.zip", 'r') as zip_ref:
            zip_ref.extractall("dataset")
        logger.info("✅ Dataset extracted")

        # Clean up
        os.remove("smsspamcollection.zip")

        return "dataset/SMSSpamCollection"

    except Exception as e:
        logger.error(f"❌ Error downloading dataset: {e}")
        logger.info("💡 Creating sample dataset instead...")
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
    logger.info("✅ Sample dataset created")
    return 'dataset/sample_spam.csv'

def load_dataset(filepath):
    """Load and prepare the spam dataset"""
    logger.info(f"📂 Loading dataset from {filepath}")

    try:
        if 'SMSSpamCollection' in filepath:
            # Original dataset format (tab-separated, no header)
            df = pd.read_csv(filepath, sep='\t', names=['label', 'message'])
        else:
            # Sample dataset format
            df = pd.read_csv(filepath)

        logger.info(f"✅ Loaded {len(df)} messages")
        logger.info(f"   - Spam: {(df['label'] == 'spam').sum()}")
        logger.info(f"   - Ham: {(df['label'] == 'ham').sum()}")

        return df

    except Exception as e:
        logger.error(f"❌ Error loading dataset: {e}")
        raise

def preprocess_dataset(df):
    """Preprocess all messages in the dataset"""
    logger.info("🔄 Preprocessing messages...")

    processed_messages = []
    for message in df['message']:
        result = email_preprocessor.preprocess_email(message, return_steps=False)
        processed_messages.append(result['final_processed_text'])

    df['processed_message'] = processed_messages
    logger.info("✅ Preprocessing complete")

    return df

def train_model(df, test_size=0.2):
    """Train Naive Bayes classifier"""
    logger.info("🤖 Training Naive Bayes model...")

    # Prepare data
    X = df['processed_message']
    y = df['label']

    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    logger.info(f"   - Training samples: {len(X_train)}")
    logger.info(f"   - Testing samples: {len(X_test)}")

    # Convert text to numerical features using CountVectorizer
    vectorizer = CountVectorizer(max_features=3000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train Naive Bayes classifier
    model = MultinomialNB()
    model.fit(X_train_vec, y_train)

    # Make predictions
    y_pred = model.predict(X_test_vec)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    logger.info(f"✅ Model trained successfully!")
    logger.info(f"   - Accuracy: {accuracy * 100:.2f}%")

    # Detailed metrics
    logger.info("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred))

    logger.info("\n📈 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return model, vectorizer, accuracy

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

def save_model(model, vectorizer, accuracy, version=None, retrained=False):
    """Save trained model and vectorizer"""
    logger.info("💾 Saving model...")

    import os
    os.makedirs('ml_models', exist_ok=True)

    # Determine version
    if version is None:
        version = get_next_version()
    
    version_str = f"{version:.1f}"

    # Model metadata
    metadata = {
        'model': model,
        'vectorizer': vectorizer,
        'accuracy': accuracy,
        'version': version_str,
        'trained_at': datetime.now().isoformat(),
        'algorithm': 'Multinomial Naive Bayes',
        'retrained': retrained,
        'features': vectorizer.get_feature_names_out().tolist() if hasattr(vectorizer, 'get_feature_names_out') else []
    }

    # Save model with version
    model_path = f'ml_models/spam_model_v{version_str}.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(metadata, f)

    # Also save as latest for easy loading
    latest_path = 'ml_models/spam_model.pkl'
    with open(latest_path, 'wb') as f:
        pickle.dump(metadata, f)

    logger.info(f"✅ Model saved to {model_path}")
    logger.info(f"   - Version: {version_str}")
    logger.info(f"   - Accuracy: {accuracy * 100:.2f}%")
    logger.info(f"   - Retrained: {retrained}")

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
    logger.info(f"🔄 Retraining model with {len(training_data)} feedback samples...")

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
        logger.info("📊 Feedback class distribution:")
        for label, count in feedback_df['label'].value_counts().items():
            logger.info(f"   - {label}: {count} samples")
        
        # Load original dataset to combine with feedback
        logger.info("📂 Loading original dataset to prevent catastrophic forgetting...")
        try:
            dataset_path = "dataset/SMSSpamCollection"
            if not Path(dataset_path).exists():
                logger.warning("⚠️  Original dataset not found, downloading...")
                dataset_path = download_dataset()
            
            base_df = load_dataset(dataset_path)
            logger.info(f"✅ Loaded {len(base_df)} samples from base dataset")
            
            # Rename column to match feedback format
            base_df = base_df.rename(columns={'message': 'text'})
            
            # Combine base dataset with feedback
            combined_df = pd.concat([base_df, feedback_df[['text', 'label']]], ignore_index=True)
            logger.info(f"📊 Combined dataset: {len(combined_df)} total samples")
            logger.info(f"   - Base: {len(base_df)}, Feedback: {len(feedback_df)}")
            
        except Exception as e:
            logger.warning(f"⚠️  Could not load base dataset: {e}")
            logger.warning("⚠️  Training only on feedback (risk of catastrophic forgetting)")
            combined_df = feedback_df
        
        # Log final class distribution
        logger.info("📊 Final training class distribution:")
        for label, count in combined_df['label'].value_counts().items():
            logger.info(f"   - {label}: {count} samples")
        
        # Check for class imbalance that could cause stratify errors
        min_class_samples = combined_df['label'].value_counts().min()
        if min_class_samples < 2:
            logger.warning(f"⚠️  Minimum class has only {min_class_samples} sample(s)")
            logger.warning("⚠️  Disabling stratification to prevent errors")
            use_stratify = False
        else:
            use_stratify = True
        
        # Preprocess combined data
        logger.info("📝 Preprocessing combined dataset...")
        processed_messages = []
        for message in combined_df['text']:
            result = email_preprocessor.preprocess_email(message, return_steps=False)
            processed_messages.append(result['final_processed_text'])
        
        combined_df['processed_message'] = processed_messages
        
        # Train model with appropriate stratification
        X = combined_df['processed_message']
        y = combined_df['label']
        
        # Split with or without stratification based on class balance
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
        
        # Train the model
        vectorizer = CountVectorizer(max_features=3000)
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        model = MultinomialNB()
        model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"✅ Model retrained successfully!")
        logger.info(f"   - Accuracy: {accuracy * 100:.2f}%")
        logger.info("\n📊 Classification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save with new version
        model_path, version = save_model(model, vectorizer, accuracy, retrained=True)
        
        logger.info(f"✅ Retraining complete! New version: {version}, Accuracy: {accuracy * 100:.2f}%")
        return accuracy, version

    except Exception as e:
        logger.error(f"❌ Retraining failed: {e}")
        raise

def main():
    """Main training pipeline"""
    logger.info("=" * 60)
    logger.info("🚀 Starting Spam Detection Model Training")
    logger.info("=" * 60)

    try:
        # Step 1: Download dataset
        dataset_path = download_dataset()

        # Step 2: Load dataset
        df = load_dataset(dataset_path)

        # Step 3: Preprocess dataset
        df = preprocess_dataset(df)

        # Step 4: Train model
        model, vectorizer, accuracy = train_model(df)

        # Step 5: Save model
        model_path, version = save_model(model, vectorizer, accuracy)

        logger.info("=" * 60)
        logger.info("✅ Training Complete!")
        logger.info(f"   Model saved at: {model_path}")
        logger.info(f"   Accuracy: {accuracy * 100:.2f}%")
        logger.info(f"   Version: {version}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()