import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class InstitutionType(str, enum.Enum):
    COLLEGE = "college"
    HOSTEL = "hostel"
    HOSPITAL = "hospital"
    HOTEL = "hotel"
    CANTEEN = "canteen"
    INDUSTRIAL_CAFETERIA = "industrial_cafeteria"
    PROCESSING_UNIT = "processing_unit"

class ReceiverType(str, enum.Enum):
    FOOD_BANK = "food_bank"
    SHELTER = "shelter"
    COMMUNITY_KITCHEN = "community_kitchen"
    SECONDARY_BUYER = "secondary_buyer"
    ANIMAL_FEED_SHELTER = "animal_feed_shelter"
    ORGANIC_RECYCLER = "organic_recycler"

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    institution_type = Column(Enum(InstitutionType), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    daily_headcount = Column(Integer, default=500)
    operating_hours = Column(String(100), default="06:00-22:00")
    cold_storage_capacity_kg = Column(Float, default=500.0)
    dry_storage_capacity_kg = Column(Float, default=2000.0)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="institution")
    kitchens = relationship("Kitchen", back_populates="institution", cascade="all, delete-orphan")
    processing_units = relationship("ProcessingUnit", back_populates="institution", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="institution")

class Kitchen(Base):
    __tablename__ = "kitchens"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    meal_capacity_per_shift = Column(Integer, default=1000)
    shifts = Column(JSON, default=lambda: ["breakfast", "lunch", "dinner"])
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    institution = relationship("Institution", back_populates="kitchens")
    production_records = relationship("ProductionRecord", back_populates="kitchen")
    consumption_records = relationship("ConsumptionRecord", back_populates="kitchen")
    waste_records = relationship("WasteRecord", back_populates="kitchen")
    surplus_records = relationship("SurplusRecord", back_populates="kitchen")
    inventory_items = relationship("Inventory", back_populates="kitchen")

class ProcessingUnit(Base):
    __tablename__ = "processing_units"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Grains and Vegetables Processing")
    processing_capacity_kg_per_day = Column(Float, default=5000.0)
    baseline_energy_kwh_per_tonne = Column(Float, default=85.0)
    baseline_loss_percentage = Column(Float, default=4.5)
    created_at = Column(DateTime, default=datetime.utcnow)

    institution = relationship("Institution", back_populates="processing_units")
    machines = relationship("Machine", back_populates="processing_unit")
    sensor_readings = relationship("SensorReading", back_populates="processing_unit")

class Receiver(Base):
    __tablename__ = "receivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    receiver_type = Column(Enum(ReceiverType), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    contact_person = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    operating_hours = Column(String(100), default="08:00-20:00")
    capacity_meals = Column(Integer, default=200)
    has_cold_storage = Column(Boolean, default=False)
    accepted_food_types = Column(JSON, default=lambda: ["cooked_meals", "raw_produce", "packaged"])
    is_verified = Column(Boolean, default=False)  # Admin must verify OSM imported receivers
    source = Column(String(50), default="manual") # "osm_overpass" or "manual"
    priority_level = Column(Integer, default=1)   # 1=standard, 2=high urgency community need
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="receiver")
    matches = relationship("ReceiverMatch", back_populates="receiver")
    donations = relationship("Donation", back_populates="receiver")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    vehicle_number = Column(String(50), nullable=False, unique=True)
    vehicle_type = Column(String(50), default="Van") # Van, Bike, Electric Trike, Truck
    capacity_kg = Column(Float, default=300.0)
    has_insulated_box = Column(Boolean, default=True)
    driver_name = Column(String(150), nullable=True)
    driver_phone = Column(String(50), nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    institution = relationship("Institution", back_populates="vehicles")
    routes = relationship("DeliveryRoute", back_populates="vehicle")
