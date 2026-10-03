import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    status = Column(String(30), default="idle")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assets = relationship("Asset", back_populates="project", cascade="all, delete-orphan")
    clips = relationship("Clip", back_populates="project", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="project", cascade="all, delete-orphan")

class Asset(Base):
    __tablename__ = "assets"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    mime_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    duration = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="assets")

class Clip(Base):
    __tablename__ = "clips"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    position = Column(Integer, default=0)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=True)
    hook = Column(Text, nullable=False)
    caption = Column(Text, nullable=False)
    confidence = Column(Float, default=0.9)
    clip_path = Column(String(500), nullable=True)
    is_selected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="clips")

class Export(Base):
    __tablename__ = "exports"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    export_path = Column(String(500), nullable=False)
    format = Column(String(20), default="9:16")
    total_duration = Column(Float, nullable=False)
    status = Column(String(30), default="ready")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="exports")
