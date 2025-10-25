import re
import nltk
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailPreprocessor:
    """
    Email preprocessing pipeline for spam detection
    """
    
    def __init__(self):
        """Initialize the preprocessor with required resources"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            
            # Load stopwords
            self.stopwords = set(nltk.corpus.stopwords.words('english'))
            logger.info(f"EmailPreprocessor initialized successfully with {len(self.stopwords)} stopwords")
            
        except Exception as e:
            logger.error(f"Error initializing EmailPreprocessor: {e}")
            # Fallback to manual stopwords list
            self.stopwords = {
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
                'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
                'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
                'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
                'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
                'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
                'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after', 
                'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 
                'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 
                'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 
                'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 
                'just', 'don', 'should', 'now'
            }
            logger.info(f"Using fallback stopwords: {len(self.stopwords)} words")
    
    def remove_html(self, text: str) -> str:
        """
        Remove HTML tags from email content
        
        Args:
            text: Raw email text with HTML
            
        Returns:
            Clean text without HTML tags
        """
        try:
            soup = BeautifulSoup(text, 'html.parser')
            clean_text = soup.get_text()
            logger.info(f"HTML removed: {len(text)} -> {len(clean_text)} characters")
            return clean_text
        except Exception as e:
            logger.error(f"Error removing HTML: {e}")
            return text
    
    def remove_symbols(self, text: str) -> str:
        """
        Remove special symbols and keep only alphanumeric characters and spaces
        
        Args:
            text: Text with symbols
            
        Returns:
            Text with symbols removed
        """
        try:
            # Keep only letters, numbers, and spaces
            clean_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
            # Remove extra whitespace
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
            logger.info(f"Symbols removed: {len(text)} -> {len(clean_text)} characters")
            return clean_text
        except Exception as e:
            logger.error(f"Error removing symbols: {e}")
            return text
    
    def remove_stopwords(self, text: str) -> str:
        """
        Remove common English stopwords
        
        Args:
            text: Text with stopwords
            
        Returns:
            Text with stopwords removed
        """
        try:
            words = text.split()
            filtered_words = [word for word in words if word.lower() not in self.stopwords]
            clean_text = ' '.join(filtered_words)
            logger.info(f"Stopwords removed: {len(words)} -> {len(filtered_words)} words")
            logger.info(f"Removed stopwords: {[word for word in words if word.lower() in self.stopwords]}")
            return clean_text
        except Exception as e:
            logger.error(f"Error removing stopwords: {e}")
            return text
    
    def to_lowercase(self, text: str) -> str:
        """
        Convert text to lowercase
        
        Args:
            text: Mixed case text
            
        Returns:
            Lowercase text
        """
        try:
            clean_text = text.lower()
            logger.info(f"Converted to lowercase: {len(text)} characters")
            return clean_text
        except Exception as e:
            logger.error(f"Error converting to lowercase: {e}")
            return text
    
    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into individual words
        
        Args:
            text: Text to tokenize
            
        Returns:
            List of tokens
        """
        try:
            tokens = nltk.word_tokenize(text)
            logger.info(f"Tokenized: {len(text.split())} words -> {len(tokens)} tokens")
            return tokens
        except Exception as e:
            logger.error(f"Error tokenizing: {e}")
            return text.split()
    
    def preprocess_email(self, email_content: str) -> Dict[str, Any]:
        """
        Complete preprocessing pipeline for email content
        
        Args:
            email_content: Raw email content
            
        Returns:
            Dictionary with preprocessing results
        """
        logger.info("Starting email preprocessing pipeline")
        logger.info(f"Original email length: {len(email_content)} characters")
        
        # Step 1: Remove HTML
        step1 = self.remove_html(email_content)
        
        # Step 2: Convert to lowercase
        step2 = self.to_lowercase(step1)
        
        # Step 3: Remove symbols
        step3 = self.remove_symbols(step2)
        
        # Step 4: Remove stopwords
        step4 = self.remove_stopwords(step3)
        
        # Step 5: Tokenize
        tokens = self.tokenize(step4)
        
        # Prepare results
        result = {
            "original": email_content,
            "step1_html_removed": step1,
            "step2_lowercase": step2,
            "step3_symbols_removed": step3,
            "step4_stopwords_removed": step4,
            "step5_tokens": tokens,
            "final_processed_text": step4,
            "token_count": len(tokens),
            "original_length": len(email_content),
            "processed_length": len(step4)
        }
        
        logger.info(f"Preprocessing complete: {len(tokens)} tokens generated")
        return result

# Create global instance
email_preprocessor = EmailPreprocessor()
