"""
Spam Detection Model Service
Loads and uses the trained model for predictions
"""

import pickle
import logging
from typing import Dict, Any
from pathlib import Path
from app.services.preprocessing import email_preprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SpamDetectionModel: # SpamDetectionModel is a class that handles the model loading and predictions
    """
    Spam detection model service
    Handles model loading and predictions
    """
    #how does this prediction work? it works by loading the model from the disk and then using the model to predict the spam or not spam by 
    def __init__(self, model_path: str = "ml_models/spam_model.pkl"):
        """
        Initialize the model service
        
        Args:
            model_path: Path to the trained model file
        """
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.metadata = None
        self.is_loaded = False
        
        # Try to load model on initialization
        self.load_model()
    
    def load_model(self) -> bool:
        """
        Load the trained model from disk
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            model_file = Path(self.model_path)
            
            if not model_file.exists():
                logger.warning(f"⚠️  Model file not found: {self.model_path}")
                logger.info("💡 Run 'python train_model.py' to train the model first")
                return False
            
            # Load model
            with open(self.model_path, 'rb') as f:
                self.metadata = pickle.load(f)
            
            self.model = self.metadata['model']
            self.vectorizer = self.metadata['vectorizer']
            
            logger.info(f"Model loaded successfully!")
            logger.info(f"   - Version: {self.metadata.get('version', 'unknown')}")
            logger.info(f"   - Accuracy: {self.metadata.get('accuracy', 0) * 100:.2f}%")
            logger.info(f"   - Algorithm: {self.metadata.get('algorithm', 'unknown')}")
            logger.info(f"   - Trained at: {self.metadata.get('trained_at', 'unknown')}")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f" Error loading model: {e}")
            self.is_loaded = False
            return False
    
    def predict(self, email_text: str) -> Dict[str, Any]:
        """
        Predict if email is spam or not
        
        Args:
            email_text: Raw email text to classify
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_loaded:
            logger.error(" Model not loaded. Cannot make predictions.")
            return {
                "error": "Model not loaded",
                "result": "unknown",
                "confidence": 0.0
            }
        
        try:
            # Preprocess email
            preprocessed = email_preprocessor.preprocess_email(email_text, return_steps=False)
            processed_text = preprocessed['final_processed_text']
            
            if not processed_text or processed_text.strip() == "":
                logger.warning("⚠️  Empty text after preprocessing")
                return {
                    "result": "ham",
                    "confidence": 0.5,
                    "message": "Unable to process empty text",
                    "original_length": len(email_text),
                    "processed_length": 0
                }
            
            # Vectorize
            text_vectorized = self.vectorizer.transform([processed_text])
            
            # Predict
            prediction = self.model.predict(text_vectorized)[0]
            
            # Get probability/confidence
            probabilities = self.model.predict_proba(text_vectorized)[0]
            confidence = float(max(probabilities))
            
            # Determine result
            result = "spam" if prediction == "spam" else "ham"
            
            logger.info(f" Prediction: {result.upper()} (confidence: {confidence * 100:.2f}%)")
            
            return {
                "result": result,
                "confidence": confidence,
                "is_spam": result == "spam",
                "processed_text": processed_text,
                "original_length": len(email_text),
                "processed_length": len(processed_text),
                "model_version": self.metadata.get('version', 'unknown')
            }
            
        except Exception as e:
            logger.error(f" Prediction error: {e}")
            return {
                "error": str(e),
                "result": "unknown",
                "confidence": 0.0
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model
        
        Returns:
            Dictionary with model metadata
        """
        if not self.is_loaded:
            return {
                "loaded": False,
                "message": "Model not loaded"
            }
        
        return {
            "loaded": True,
            "version": self.metadata.get('version', 'unknown'),
            "accuracy": self.metadata.get('accuracy', 0),
            "algorithm": self.metadata.get('algorithm', 'unknown'),
            "trained_at": self.metadata.get('trained_at', 'unknown'),
            "model_path": self.model_path
        }

# Create global model instance
spam_model = SpamDetectionModel() # spam_model is a global model instance that is used to predict the spam or not spam by the SpamDetectionModel class.