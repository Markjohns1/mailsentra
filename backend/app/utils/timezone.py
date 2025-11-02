"""
Timezone utility functions
Provides timezone-related utilities for the application
"""

from datetime import datetime
from zoneinfo import ZoneInfo
from app.config import settings

# Default timezone from settings
DEFAULT_TZ = ZoneInfo(settings.TIMEZONE)

def get_current_time(timezone: ZoneInfo = None) -> datetime:
    """
    Get current time in the specified timezone
    
    Args:
        timezone: Timezone to use (defaults to application timezone)
        
    Returns:
        datetime object with timezone info
    """
    tz = timezone or DEFAULT_TZ
    return datetime.now(tz)

def get_nairobi_time() -> datetime:
    """
    Get current time in Nairobi timezone (for backward compatibility)
    
    Returns:
        datetime object in Nairobi timezone
    """
    return datetime.now(ZoneInfo("Africa/Nairobi"))
