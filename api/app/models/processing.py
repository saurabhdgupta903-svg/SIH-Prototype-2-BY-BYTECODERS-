import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from ..database import Base

class MachineStatus(str, enum.Enum):
    RUNNING = "Running"
    REDUCED_EFFICIENCY = "Reduced efficiency"
    DOWNTIME = "Downtime"

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    processing_unit_id = Column(Integer, ForeignKey("processing_units.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    machine_type = Column(String(100), default="Grain Sifter / Separator")
    status = Column(Enum(MachineStatus), default=MachineStatus.RUNNING)
    current_efficiency_pct = Column(Float, default=94.5)
    rated_power_kw = Column(Float, default=15.0)
    current_power_draw_kw = Column(Float, default=14.2)
    operating_hours_today = Column(Float, default=7.5)
    last_service_date = Column(DateTime, default=datetime.utcnow)

    processing_unit = relationship("ProcessingUnit", back_populates="machines")
    events = relationship("MachineEvent", back_populates="machine")

class MachineEvent(Base):
    __tablename__ = "machine_events"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False) # downtime, reduced_efficiency, maintenance
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float, default=0.0)
    reason = Column(Text, nullable=False)
    loss_estimate_kg = Column(Float, default=0.0)

    machine = relationship("Machine", back_populates="events")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    processing_unit_id = Column(Integer, ForeignKey("processing_units.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(100), default="Cold Room A") # Cold Storage, Dry Warehouse, Processing Floor
    sensor_type = Column(String(50), nullable=False)      # temperature, humidity, door_status, power_kw
    reading_value = Column(Float, nullable=False)
    unit = Column(String(20), default="C")
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String(255), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    processing_unit = relationship("ProcessingUnit", back_populates="sensor_readings")
