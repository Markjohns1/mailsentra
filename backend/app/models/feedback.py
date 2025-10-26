from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class UserFeedback(Base):
    """User feedback model for correcting spam classifications"""
    __tablename__ = "user_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    spam_log_id = Column(Integer, ForeignKey("spam_logs.id", ondelete="CASCADE"), nullable=False)
    original_result = Column(String(50), nullable=False)  # Original prediction
    corrected_result = Column(String(50), nullable=False)  # User's correction
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    spam_log = relationship("SpamLog", back_populates="feedbacks")

    def __repr__(self):
        return f"<UserFeedback(id={self.id}, original={self.original_result}, corrected={self.corrected_result})>"