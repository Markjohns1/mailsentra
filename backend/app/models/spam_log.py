from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from zoneinfo import ZoneInfo

NAIROBI_TZ = ZoneInfo("Africa/Nairobi")

def get_nairobi_time():
    """Get current time in Nairobi timezone"""
    return datetime.now(NAIROBI_TZ)

class SpamLog(Base):
    """Spam log model for storing analysis results"""
    __tablename__ = "spam_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email_id = Column(Integer, ForeignKey("emails.id", ondelete="CASCADE"), nullable=True)
    email_text = Column(Text, nullable=False)
    result = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=True)
    model_version = Column(String(50), nullable=True)
    is_correct = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    
    # Relationships
    user = relationship("User", back_populates="spam_logs")
    email = relationship("Email", back_populates="spam_logs")
    feedbacks = relationship("UserFeedback", back_populates="spam_log", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SpamLog(id={self.id}, result={self.result}, confidence={self.confidence})>"