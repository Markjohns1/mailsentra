"""
Retraining service for model improvement using user feedback.
"""

import pandas as pd
import pickle
import logging
from datetime import datetime
from pathlib import Path
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from app.services.preprocessing import email_preprocessor

logger = logging.getLogger(__name__)


def train_model_from_data(training_data):
    """
    Train model from user feedback data.
    
    Parameters:
        training_data: List of dicts with 'text', 'label', 'original' keys
    
    Returns:
        Tuple of (accuracy, version)
    """
    try:
        logger.info("Starting model retraining from user feedback")
        
        if not training_data or len(training_data) < 10:
            raise ValueError("Insufficient training data")
        
        # Load original dataset to maintain baseline
        try:
            original_df = pd.read_csv('dataset/SMSSpamCollection', sep='\t', names=['label', 'message'])
            logger.info(f"Loaded {len(original_df)} original samples")
        except:
            logger.warning("Could not load original dataset, using only feedback data")
            original_df = None
        
        # Prepare feedback data
        df_feedback = pd.DataFrame(training_data)
        
        # Combine with original dataset
        if original_df is not None:
            # Keep original preprocessing
            messages = df_feedback['text'].tolist() + original_df['message'].tolist()
            labels = df_feedback['label'].tolist() + original_df['label'].tolist()
        else:
            messages = df_feedback['text'].tolist()
            labels = df_feedback['label'].tolist()
        
        # Preprocess all messages
        logger.info("Preprocessing messages...")
        processed_messages = []
        for message in messages:
            result = email_preprocessor.preprocess_email(str(message), return_steps=False)
            processed_messages.append(result['final_processed_text'])
        
        # Convert to DataFrame
        df = pd.DataFrame({
            'processed_message': processed_messages,
            'label': labels
        })
        
        # Split data
        X = df['processed_message']
        y = df['label']
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        logger.info(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
        
        # Vectorize
        vectorizer = CountVectorizer(max_features=3000)
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)
        
        # Train model
        model = MultinomialNB()
        model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Model trained with accuracy: {accuracy * 100:.2f}%")
        
        # Save model
        version = datetime.now().strftime("%Y%m%d_%H%M%S")
        metadata = {
            'model': model,
            'vectorizer': vectorizer,
            'accuracy': accuracy,
            'version': version,
            'trained_at': datetime.now().isoformat(),
            'algorithm': 'Multinomial Naive Bayes',
            'training_samples': len(X_train)
        }
        
        Path('ml_models').mkdir(exist_ok=True)
        model_path = 'ml_models/spam_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(metadata, f)
        
        logger.info(f"Model saved to {model_path}")
        
        return accuracy, version
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

