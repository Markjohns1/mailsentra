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
    Production-ready implementation with error handling and logging
    """

    def __init__(self):
        """Initialize the preprocessor with required NLTK resources"""
        try:
            # Download required NLTK data silently
            nltk.download('punkt', quiet=True)
            nltk.download('punkt_tab', quiet=True)  # For Python 3.14+
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)

            # Load stopwords from NLTK
            from nltk.corpus import stopwords
            self.stopwords = set(stopwords.words('english'))
            logger.info(f"EmailPreprocessor initialized with {len(self.stopwords)} stopwords")

        except Exception as e:
            logger.warning(f"NLTK initialization failed: {e}. Using fallback stopwords.")
            # Comprehensive fallback stopwords list
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
                'just', 'don', 'should', 'now', 'also', 'would', 'could', 'may', 'might', 'must'
            }
            logger.info(f"Using fallback stopwords: {len(self.stopwords)} words")

    def remove_html(self, text: str) -> str:
        """
        Remove HTML tags and decode HTML entities from email content

        Args:
            text: Raw email text potentially containing HTML

        Returns:
            Clean text without HTML tags or entities
        """
        if not text or not isinstance(text, str):
            return ""

        try:
            # Parse HTML and extract text
            soup = BeautifulSoup(text, 'html.parser')

            # Remove script and style elements
            for script_or_style in soup(['script', 'style']):
                script_or_style.decompose()

            # Get text and clean up whitespace
            clean_text = soup.get_text(separator=' ')
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()

            logger.debug(f"HTML removed: {len(text)} → {len(clean_text)} chars")
            return clean_text

        except Exception as e:
            logger.error(f"Error removing HTML: {e}")
            return text

    def remove_urls(self, text: str) -> str:
        """
        Remove URLs from text (common in spam emails)

        Args:
            text: Text potentially containing URLs

        Returns:
            Text with URLs removed
        """
        if not text:
            return ""

        try:
            # Remove http/https URLs
            text = re.sub(r'https?://\S+', '', text)
            # Remove www URLs
            text = re.sub(r'www\.\S+', '', text)
            # Clean up extra spaces
            text = re.sub(r'\s+', ' ', text).strip()
            return text
        except Exception as e:
            logger.error(f"Error removing URLs: {e}")
            return text

    def remove_emails(self, text: str) -> str:
        """
        Remove email addresses from text

        Args:
            text: Text potentially containing email addresses

        Returns:
            Text with email addresses removed
        """
        if not text:
            return ""

        try:
            # Remove email addresses
            text = re.sub(r'\S+@\S+', '', text)
            # Clean up extra spaces
            text = re.sub(r'\s+', ' ', text).strip()
            return text
        except Exception as e:
            logger.error(f"Error removing emails: {e}")
            return text

    def remove_symbols(self, text: str) -> str:
        """
        Remove special symbols and keep only alphanumeric characters and spaces

        Args:
            text: Text with special symbols

        Returns:
            Text with only letters, numbers, and spaces
        """
        if not text:
            return ""

        try:
            # Keep only letters, numbers, and spaces
            clean_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
            # Remove extra whitespace
            clean_text = re.sub(r'\s+', ' ', clean_text).strip()

            logger.debug(f"Symbols removed: {len(text)} → {len(clean_text)} chars")
            return clean_text

        except Exception as e:
            logger.error(f"Error removing symbols: {e}")
            return text

    def to_lowercase(self, text: str) -> str:
        """
        Convert text to lowercase for uniformity

        Args:
            text: Mixed case text

        Returns:
            Lowercase text
        """
        if not text:
            return ""

        try:
            return text.lower()
        except Exception as e:
            logger.error(f"Error converting to lowercase: {e}")
            return text

    def remove_stopwords(self, text: str) -> str:
        """
        Remove common English stopwords that don't contribute to spam detection

        Args:
            text: Text containing stopwords

        Returns:
            Text with stopwords removed
        """
        if not text:
            return ""

        try:
            words = text.split()
            filtered_words = [word for word in words if word.lower() not in self.stopwords]

            removed_count = len(words) - len(filtered_words)
            if removed_count > 0:
                logger.debug(f"Stopwords removed: {removed_count} words")

            return ' '.join(filtered_words)

        except Exception as e:
            logger.error(f"Error removing stopwords: {e}")
            return text

    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into individual words

        Args:
            text: Text to tokenize

        Returns:
            List of tokens (words)
        """
        if not text:
            return []

        try:
            # Try NLTK tokenization first
            tokens = nltk.word_tokenize(text)
            logger.debug(f"Tokenized: {len(tokens)} tokens")
            return tokens

        except Exception as e:
            logger.debug(f"NLTK tokenization fell back to split(): {type(e).__name__}")
            # Fallback to simple split (silent, not warning)
            return text.split()

    def preprocess_email(self, email_content: str, return_steps: bool = False) -> Dict[str, Any]:
        """
        Complete preprocessing pipeline for email content
        Applies all preprocessing steps in the correct order

        Args:
            email_content: Raw email content
            return_steps: If True, return intermediate steps for debugging

        Returns:
            Dictionary containing:
                - final_processed_text: Fully cleaned text
                - tokens: List of tokens
                - token_count: Number of tokens
                - original_length: Original text length
                - processed_length: Processed text length
                - (optional) intermediate steps if return_steps=True
        """
        if not email_content or not isinstance(email_content, str):
            logger.warning("Empty or invalid email content provided")
            return {
                "final_processed_text": "",
                "tokens": [],
                "token_count": 0,
                "original_length": 0,
                "processed_length": 0
            }

        logger.info(f"Starting preprocessing pipeline ({len(email_content)} chars)")

        # Step 1: Remove HTML tags and entities
        step1 = self.remove_html(email_content)

        # Step 2: Remove URLs
        step2 = self.remove_urls(step1)

        # Step 3: Remove email addresses
        step3 = self.remove_emails(step2)

        # Step 4: Convert to lowercase
        step4 = self.to_lowercase(step3)

        # Step 5: Remove symbols and special characters
        step5 = self.remove_symbols(step4)

        # Step 6: Remove stopwords
        step6 = self.remove_stopwords(step5)

        # Step 7: Tokenize
        tokens = self.tokenize(step6)

        # Prepare result
        result = {
            "final_processed_text": step6,
            "tokens": tokens,
            "token_count": len(tokens),
            "original_length": len(email_content),
            "processed_length": len(step6),
            "reduction_percentage": round((1 - len(step6)/len(email_content)) * 100, 2) if len(email_content) > 0 else 0
        }

        # Add intermediate steps if requested (useful for debugging)
        if return_steps:
            result.update({
                "step1_html_removed": step1,
                "step2_urls_removed": step2,
                "step3_emails_removed": step3,
                "step4_lowercase": step4,
                "step5_symbols_removed": step5,
                "step6_stopwords_removed": step6,
            })

        logger.info(f"Preprocessing complete: {len(tokens)} tokens generated ({result['reduction_percentage']}% reduction)")

        return result

# Create global singleton instance
email_preprocessor = EmailPreprocessor()