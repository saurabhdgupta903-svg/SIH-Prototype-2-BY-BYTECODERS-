import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from ..database import Base

class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    alert_type = Column(String(100), nullable=False) # surplus_predicted, storage_anomaly, quality_verification, matching_donation, rising_waste
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.INFO)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(255), nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    channel = Column(String(50), default="web_push") # web_push, email, simulated_sms
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String(50), default="sent") # sent, simulated, failed
    created_at = Column(DateTime, default=datetime.utcnow)

class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    metric_date = Column(Date, nullable=False, index=True)
    food_rescued_kg = Column(Float, default=0.0)
    meals_redistributed = Column(Integer, default=0)
    waste_prevented_kg = Column(Float, default=0.0)
    co2e_avoided_kg = Column(Float, default=0.0)
    cost_saved_inr = Column(Float, default=0.0)
    water_conserved_litres = Column(Float, default=0.0)

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    commodity_or_resource = Column(String(150), nullable=False, unique=True)
    emission_factor_kg_co2e = Column(Float, nullable=False)
    unit = Column(String(50), default="kg CO2e / kg")
    source_citation = Column(String(255), nullable=False) # e.g. "IPCC AR6 / WRAP UK Food Waste Benchmark 2021"
    assumptions = Column(Text, nullable=True)
