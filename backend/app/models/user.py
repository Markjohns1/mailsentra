from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from zoneinfo import ZoneInfo

NAIROBI_TZ = ZoneInfo("Africa/Nairobi")

def get_nairobi_time():
    """Get current time in Nairobi timezone"""
    return datetime.now(NAIROBI_TZ)

class User(Base):
    """User model for authentication"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_nairobi_time)
    updated_at = Column(DateTime(timezone=True), default=get_nairobi_time, onupdate=get_nairobi_time)
    
    # Relationships
    emails = relationship("Email", back_populates="user", cascade="all, delete-orphan")
    spam_logs = relationship("SpamLog", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"