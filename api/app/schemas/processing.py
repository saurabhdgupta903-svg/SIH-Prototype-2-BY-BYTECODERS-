from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MachineStatusSummary(BaseModel):
    id: int
    name: str
    machine_type: str
    status: str # Running, Reduced efficiency, Downtime
    current_efficiency_pct: float
    rated_power_kw: float
    current_power_draw_kw: float
    operating_hours_today: float
    is_anomaly: bool
    anomaly_detail: Optional[str] = None

class StorageSensorData(BaseModel):
    id: int
    location: str
    sensor_type: str
    reading_value: float
    unit: str
    is_anomaly: bool
    anomaly_reason: Optional[str] = None
    recorded_at: datetime

class ProcessingUnitDashboard(BaseModel):
    unit_id: int
    unit_name: str
    raw_material_received_today_kg: float
    processed_today_kg: float
    yield_efficiency_pct: float
    process_loss_kg: float
    process_loss_pct: float
    historical_baseline_loss_pct: float
    loss_anomaly_detected: bool
    loss_anomaly_notes: Optional[str] = None
    energy_kwh_per_tonne: float
    baseline_energy_kwh_per_tonne: float
    excess_energy_detected: bool
    excess_energy_notes: Optional[str] = None
    machines: List[MachineStatusSummary]
    recent_sensors: List[StorageSensorData]
    is_simulated: bool = True
