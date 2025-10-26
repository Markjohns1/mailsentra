from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Email(Base):
    """Email model for storing email content"""
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(500), nullable=True)
    sender = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="emails")
    spam_logs = relationship("SpamLog", back_populates="email", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Email(id={self.id}, user_id={self.user_id}, subject={self.subject[:30]})>"