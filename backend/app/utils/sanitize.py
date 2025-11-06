"""
Input sanitization utilities for security
Prevents XSS and injection attacks
"""

import html
import re
from typing import Optional


def sanitize_text(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize user input text to prevent XSS attacks
    
    Args:
        text: Raw user input
        max_length: Optional maximum length to truncate
        
    Returns:
        Sanitized text safe for display
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Escape HTML entities
    sanitized = html.escape(text)
    
    # Remove script tags and event handlers
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    sanitized = re.sub(r'on\w+\s*=', '', sanitized, flags=re.IGNORECASE)
    
    # Truncate if needed
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized


def sanitize_email_text(email_text: str) -> str:
    """
    Sanitize email text for storage
    Removes potentially dangerous content while preserving structure
    
    Args:
        email_text: Raw email content
        
    Returns:
        Sanitized email text
    """
    if not email_text:
        return ""
    
    # Remove null bytes
    email_text = email_text.replace('\x00', '')
    
    # Limit length to prevent DoS
    if len(email_text) > 10000:
        email_text = email_text[:10000]
    
    return email_text

