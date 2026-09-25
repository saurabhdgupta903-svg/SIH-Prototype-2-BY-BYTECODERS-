from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True, index=True)
    category = Column(String(100), default="Cooked Staples") # Grains, Vegetables, Dairy, Pulses, Cooked Staples
    unit = Column(String(20), default="kg")
    shelf_life_hours = Column(Integer, default=6) # Safe holding hours at room temp
    emission_factor_kg_co2_per_kg = Column(Float, default=2.5) # IPCC/WRAP factor
    cost_per_kg_inr = Column(Float, default=65.0)
    water_footprint_litres_per_kg = Column(Float, default=1200.0) # FAO factor
    is_perishable = Column(Boolean, default=True)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    meal_type = Column(String(50), nullable=False) # breakfast, lunch, dinner
    standard_batch_portions = Column(Integer, default=100)
    ingredients = Column(JSON, default=list) # [{"item_id": 1, "name": "Rice", "qty_kg": 15.0}]
    created_at = Column(DateTime, default=datetime.utcnow)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id", ondelete="CASCADE"), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id", ondelete="CASCADE"), nullable=False)
    quantity_kg = Column(Float, nullable=False, default=0.0)
    min_threshold_kg = Column(Float, default=20.0)
    storage_type = Column(String(50), default="dry") # dry, cold, frozen
    batch_number = Column(String(50), nullable=True)
    expiry_date = Column(Date, nullable=True)
    last_restocked = Column(DateTime, default=datetime.utcnow)

    kitchen = relationship("Kitchen", back_populates="inventory_items")
    food_item = relationship("FoodItem")

class ProductionRecord(Base):
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id", ondelete="CASCADE"), nullable=False)
    record_date = Column(Date, nullable=False, index=True)
    meal_type = Column(String(50), nullable=False, index=True) # breakfast, lunch, dinner
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    planned_portions = Column(Integer, nullable=False)
    recommended_portions = Column(Integer, nullable=False)
    actual_portions = Column(Integer, nullable=False)
    planned_kg = Column(Float, nullable=False)
    actual_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    kitchen = relationship("Kitchen", back_populates="production_records")
    food_item = relationship("FoodItem")

class ConsumptionRecord(Base):
    __tablename__ = "consumption_records"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id", ondelete="CASCADE"), nullable=False)
    record_date = Column(Date, nullable=False, index=True)
    meal_type = Column(String(50), nullable=False, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    headcount = Column(Integer, nullable=False)
    consumed_kg = Column(Float, nullable=False)
    consumed_portions = Column(Integer, nullable=False)
    temperature_c = Column(Float, nullable=True)
    precipitation_mm = Column(Float, nullable=True)
    is_holiday = Column(Boolean, default=False)
    is_exam_period = Column(Boolean, default=False)
    is_weekend = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    kitchen = relationship("Kitchen", back_populates="consumption_records")
    food_item = relationship("FoodItem")
