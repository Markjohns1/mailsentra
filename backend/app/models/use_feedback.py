from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text 
from sqlalchemy.orm import relationship
from app.database import Base # Base is like a base class for all the models. it is used to inherit things like the id, primary key, index, nullable, etc. from.
from datetime import datetime
from zoneinfo import ZoneInfo

NAIROBI_TZ = ZoneInfo("Africa/Nairobi")

def get_nairobi_time():
    """Get current time in Nairobi timezone"""
    return datetime.now(NAIROBI_TZ)

class UserFeedback(Base):
    """User feedback model for correcting spam classifications"""
    __tablename__ = "user_feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    spam_log_id = Column(Integer, ForeignKey("spam_logs.id", ondelete="CASCADE"), nullable=False)
    original_result = Column(String(50), nullable=False)
    corrected_result = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    
    # Relationships (this is a relationship between the UserFeedback model and the User model and the SpamLog model)
    user = relationship("User", back_populates="feedbacks")
    spam_log = relationship("SpamLog", back_populates="feedbacks")
    
    def __repr__(self):
        return f"<UserFeedback(id={self.id}, original={self.original_result}, corrected={self.corrected_result})>"