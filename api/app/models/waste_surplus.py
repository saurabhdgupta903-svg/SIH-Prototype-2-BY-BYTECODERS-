import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class WasteReason(str, enum.Enum):
    OVERPRODUCTION = "overproduction"
    SPOILAGE = "spoilage"
    EXPIRY = "expiry"
    PREPARATION_WASTE = "preparation_waste"
    STORAGE_ISSUE = "storage_issue"
    LOW_DEMAND = "low_demand"
    PLATE_WASTE = "plate_waste"
    EQUIPMENT_ISSUE = "equipment_issue"
    OTHER = "other"

class SurplusStatus(str, enum.Enum):
    IDENTIFIED = "identified"
    SCREENED = "screened"
    MATCHED = "matched"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    EXPIRED = "expired"

class RecoveryPath(str, enum.Enum):
    EDIBLE_DONATION = "edible_donation"
    SECONDARY_BUYER = "secondary_buyer"
    ANIMAL_FEED = "animal_feed"
    ORGANIC_RECYCLING = "organic_recycling" # Compost / Biogas

class QualityRiskCategory(str, enum.Enum):
    LOW_APPARENT_RISK = "Low apparent risk"
    VERIFICATION_REQUIRED = "Verification required"
    DO_NOT_REDISTRIBUTE = "Do not redistribute"

class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    reason = Column(Enum(WasteReason), nullable=False)
    notes = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    client_offline_id = Column(String(100), nullable=True, unique=True, index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    synced_at = Column(DateTime, default=datetime.utcnow)

    kitchen = relationship("Kitchen", back_populates="waste_records")
    food_item = relationship("FoodItem")

class SurplusRecord(Base):
    __tablename__ = "surplus_records"

    id = Column(Integer, primary_key=True, index=True)
    traceability_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. FL-2026-000182
    kitchen_id = Column(Integer, ForeignKey("kitchens.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    description = Column(String(255), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    estimated_portions = Column(Integer, nullable=False)
    prepared_at = Column(DateTime, nullable=False)
    ready_time = Column(DateTime, nullable=False)
    safe_pickup_window_start = Column(DateTime, nullable=False)
    safe_pickup_window_end = Column(DateTime, nullable=False)
    status = Column(Enum(SurplusStatus), default=SurplusStatus.IDENTIFIED, index=True)
    recommended_recovery_path = Column(Enum(RecoveryPath), default=RecoveryPath.EDIBLE_DONATION)
    storage_temp_c = Column(Float, default=65.0) # Hot holding or cold holding
    is_perishable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    kitchen = relationship("Kitchen", back_populates="surplus_records")
    food_item = relationship("FoodItem")
    quality_check = relationship("QualityCheck", back_populates="surplus", uselist=False)
    matches = relationship("ReceiverMatch", back_populates="surplus")
    donation = relationship("Donation", back_populates="surplus", uselist=False)

class QualityCheck(Base):
    __tablename__ = "quality_checks"

    id = Column(Integer, primary_key=True, index=True)
    surplus_id = Column(Integer, ForeignKey("surplus_records.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Level 1 rule-based parameters
    preparation_timestamp = Column(DateTime, nullable=False)
    current_timestamp = Column(DateTime, default=datetime.utcnow)
    holding_hours = Column(Float, nullable=False)
    storage_temperature_c = Column(Float, nullable=False)
    packaging_integrity = Column(String(50), default="intact") # intact, sealed, open
    rule_check_passed = Column(Boolean, default=True)
    rule_check_summary = Column(Text, nullable=True)

    # Level 2 vision screening
    image_url = Column(String(500), nullable=True)
    vision_risk_score = Column(Float, default=0.15) # 0.0 to 1.0
    risk_category = Column(Enum(QualityRiskCategory), default=QualityRiskCategory.LOW_APPARENT_RISK)
    vision_assessment_notes = Column(Text, nullable=True)

    # Human supervisor approval
    approval_status = Column(String(50), default="pending") # pending, approved, rejected
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approval_timestamp = Column(DateTime, nullable=True)
    approval_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    surplus = relationship("SurplusRecord", back_populates="quality_check")
    approved_by = relationship("User")
