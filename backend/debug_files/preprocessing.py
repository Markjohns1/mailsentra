from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.services.preprocessing import email_preprocessor
from typing import Dict, Any

router = APIRouter()

class EmailContent(BaseModel):
    content: str

class PreprocessingResponse(BaseModel):
    original: str
    step1_html_removed: str
    step2_lowercase: str 
    step3_symbols_removed: str 
    step4_stopwords_removed: str
    step5_tokens: list
    final_processed_text: str
    token_count: int
    original_length: int
    processed_length: int

@router.post("/preprocess", response_model=PreprocessingResponse) 
def preprocess_email(email_data: EmailContent):
    """
    Preprocess email content through the cleaning pipeline
    
    Args:
        email_data: Email content to preprocess
        
    Returns:
        Preprocessing results with all steps
    """
    try:
        result = email_preprocessor.preprocess_email(email_data.content)
        return PreprocessingResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preprocessing failed: {str(e)}"
        )

@router.get("/test")
def test_preprocessing():
    """
    Test endpoint with sample email content
    """
    sample_email = """
    <html>
    <body>
        <h1>WIN $1000 NOW!!!</h1>
        <p>Dear Customer,</p>
        <p>You have WON $1,000,000 in our lottery! Click here to claim your prize!</p>
        <p>This is a LIMITED TIME offer. Act NOW!</p>
        <a href="http://fake-lottery.com">Claim Prize</a>
    </body>
    </html>
    """
    
    try:
        result = email_preprocessor.preprocess_email(sample_email)
        return {
            "message": "Preprocessing test completed successfully",
            "sample_email": sample_email,
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test preprocessing failed: {str(e)}"
        )

@router.get("/debug")
def debug_preprocessing():
    """
    Debug endpoint to check stopwords loading
    """
    from app.services.preprocessing import email_preprocessor
    
    return {
        "stopwords_loaded": len(email_preprocessor.stopwords),
        "sample_stopwords": list(email_preprocessor.stopwords)[:20],
        "test_text": "this is a test with common words",
        "words_in_text": "this is a test with common words".split(),
        "filtered_words": [word for word in "this is a test with common words".split() if word.lower() not in email_preprocessor.stopwords]
    }
