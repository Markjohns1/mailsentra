"""
Spam Detection Model Training Script
Trains a Naive Bayes classifier on SMS Spam Collection dataset
"""

import pandas as pd
import pickle
import logging
from datetime import datetime
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
    logger.info("📥 Downloading spam dataset...")
    
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
            'Congratulations! You won a FREE iPhone. Claim now!',
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

def train_model(df):
    """Train Naive Bayes classifier"""
    logger.info("🧠 Training Naive Bayes model...")
    
    # Prepare data
    X = df['processed_message']
    y = df['label']
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
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
    
    logger.info("\n📊 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    return model, vectorizer, accuracy

def save_model(model, vectorizer, accuracy):
    """Save trained model and vectorizer"""
    logger.info("💾 Saving model...")
    
    import os
    os.makedirs('ml_models', exist_ok=True)
    
    # Model metadata
    metadata = {
        'model': model,
        'vectorizer': vectorizer,
        'accuracy': accuracy,
        'version': '1.0.0',
        'trained_at': datetime.now().isoformat(),
        'algorithm': 'Multinomial Naive Bayes',
        'features': vectorizer.get_feature_names_out().tolist() if hasattr(vectorizer, 'get_feature_names_out') else []
    }
    
    # Save model
    model_path = 'ml_models/spam_model.pkl'
    with open(model_path, 'wb') as f:
        pickle.dump(metadata, f)
    
    logger.info(f"✅ Model saved to {model_path}")
    logger.info(f"   - Version: 1.0.0")
    logger.info(f"   - Accuracy: {accuracy * 100:.2f}%")
    
    return model_path

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
        model_path = save_model(model, vectorizer, accuracy)
        
        logger.info("=" * 60)
        logger.info("✅ Training Complete!")
        logger.info(f"   Model saved at: {model_path}")
        logger.info(f"   Accuracy: {accuracy * 100:.2f}%")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()