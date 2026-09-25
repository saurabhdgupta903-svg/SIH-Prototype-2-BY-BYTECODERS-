from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class ReceiverMatch(Base):
    __tablename__ = "receiver_matches"

    id = Column(Integer, primary_key=True, index=True)
    surplus_id = Column(Integer, ForeignKey("surplus_records.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("receivers.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, nullable=False) # 0 to 100
    food_compatibility_score = Column(Float, nullable=False) # 0 to 25
    quantity_fit_score = Column(Float, nullable=False)       # 0 to 25
    storage_capability_score = Column(Float, nullable=False) # 0 to 20
    distance_km = Column(Float, nullable=False)
    eta_minutes = Column(Float, nullable=False)
    urgency_score = Column(Float, nullable=False)            # 0 to 30
    plain_language_reason = Column(Text, nullable=False)
    status = Column(String(50), default="proposed") # proposed, accepted, declined, expired
    created_at = Column(DateTime, default=datetime.utcnow)

    surplus = relationship("SurplusRecord", back_populates="matches")
    receiver = relationship("Receiver", back_populates="matches")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    surplus_id = Column(Integer, ForeignKey("surplus_records.id", ondelete="CASCADE"), nullable=False, unique=True)
    receiver_id = Column(Integer, ForeignKey("receivers.id", ondelete="CASCADE"), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    portions = Column(Integer, nullable=False)
    status = Column(String(50), default="matched") # matched, driver_assigned, picked_up, in_transit, delivered, confirmed
    accepted_at = Column(DateTime, nullable=True)
    scheduled_pickup_time = Column(DateTime, nullable=True)
    picked_up_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    confirmed_received_portions = Column(Integer, nullable=True)
    confirmation_notes = Column(Text, nullable=True)
    receiver_confirm_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    surplus = relationship("SurplusRecord", back_populates="donation")
    receiver = relationship("Receiver", back_populates="donations")
    delivery = relationship("Delivery", back_populates="donation", uselist=False)

class DeliveryRoute(Base):
    __tablename__ = "delivery_routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. RT-2026-0042
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    driver_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="assigned") # assigned, in_transit, completed, cancelled
    total_distance_km = Column(Float, default=0.0)
    estimated_duration_minutes = Column(Float, default=0.0)
    route_geometry = Column(JSON, nullable=True) # GeoJSON LineString coordinates
    stops_summary = Column(JSON, default=list)   # Ordered list of stops
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="routes")
    driver = relationship("User")
    deliveries = relationship("Delivery", back_populates="route")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("delivery_routes.id", ondelete="CASCADE"), nullable=False)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False, unique=True)
    stop_sequence = Column(Integer, default=1)
    status = Column(String(50), default="assigned") # assigned, picked_up, in_transit, delivered
    current_driver_lat = Column(Float, nullable=True)
    current_driver_lng = Column(Float, nullable=True)
    last_telemetry_timestamp = Column(DateTime, nullable=True)
    delivered_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    route = relationship("DeliveryRoute", back_populates="deliveries")
    donation = relationship("Donation", back_populates="delivery")
