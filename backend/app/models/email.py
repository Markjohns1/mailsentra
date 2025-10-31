from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from zoneinfo import ZoneInfo

NAIROBI_TZ = ZoneInfo("Africa/Nairobi") 

def get_nairobi_time():
    """Get current time in Nairobi timezone"""
    return datetime.now(NAIROBI_TZ)

class Email(Base):
    """Email model for storing email content"""
    __tablename__ = "emails" #__tablename__ is a special variable that holds the name of the table in the database. it is used to tell the database what table to use.
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(500), nullable=True)
    sender = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    
    # Relationships
    user = relationship("User", back_populates="emails")
    spam_logs = relationship("SpamLog", back_populates="email", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Email(id={self.id}, user_id={self.user_id}, subject={self.subject[:30] if self.subject else 'No subject'})>"