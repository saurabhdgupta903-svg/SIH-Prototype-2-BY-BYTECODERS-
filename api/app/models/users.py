import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    KITCHEN_MANAGER = "kitchen_manager"
    FPU_MANAGER = "fpu_manager"
    RECEIVER = "receiver"
    DRIVER = "driver"
    REVIEWER = "reviewer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.KITCHEN_MANAGER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Optional association with an institution or receiver
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    receiver_id = Column(Integer, ForeignKey("receivers.id", ondelete="SET NULL"), nullable=True)

    institution = relationship("Institution", back_populates="users", foreign_keys=[institution_id])
    receiver = relationship("Receiver", back_populates="users", foreign_keys=[receiver_id])
    audit_logs = relationship("AuditLog", back_populates="user")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "APPROVE_QUALITY_RELEASE", "OVERRIDE_RECIPE"
    resource_type = Column(String(100), nullable=False)      # e.g., "surplus", "quality_check"
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
