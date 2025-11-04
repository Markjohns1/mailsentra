from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class TrainingSection(Base):
    __tablename__ = "training_sections"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    icon = Column(String(50), default="mail")
    order = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    examples = relationship("TrainingExample", back_populates="section", cascade="all, delete-orphan")
    quiz_questions = relationship("TrainingQuiz", back_populates="section", cascade="all, delete-orphan")
    tips = relationship("TrainingTip", back_populates="section", cascade="all, delete-orphan")


class TrainingExample(Base):
    __tablename__ = "training_examples"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("training_sections.id", ondelete="CASCADE"))
    type = Column(String(20), nullable=False)
    subject = Column(String(500))
    content = Column(Text, nullable=False)
    analysis = Column(Text)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("TrainingSection", back_populates="examples")


class TrainingQuiz(Base):
    __tablename__ = "training_quiz"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("training_sections.id", ondelete="CASCADE"))
    question = Column(Text, nullable=False)
    correct_answer = Column(String(20), nullable=False)
    explanation = Column(Text)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("TrainingSection", back_populates="quiz_questions")


class TrainingTip(Base):
    __tablename__ = "training_tips"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("training_sections.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), default="mail")
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    section = relationship("TrainingSection", back_populates="tips")
