from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RouteStop(BaseModel):
    sequence: int
    stop_type: str # pickup, dropoff
    location_name: str
    address: str
    latitude: float
    longitude: float
    items_kg: float
    portions: int
    estimated_arrival: str

class RouteOptimizationResponse(BaseModel):
    route_code: str
    vehicle_id: Optional[int]
    total_distance_km: float
    estimated_duration_minutes: float
    stops: List[RouteStop]
    route_geometry: Dict[str, Any] # GeoJSON Feature or coordinates array
    status: str

class DriverLocationUpdate(BaseModel):
    driver_id: int
    route_code: str
    latitude: float
    longitude: float
    heading: Optional[float] = None
    speed_kmh: Optional[float] = None
    timestamp: datetime

class DeliveryConfirmRequest(BaseModel):
    confirmed_portions: int
    notes: Optional[str] = None
    receiver_name: str

class TraceabilityTimelineEvent(BaseModel):
    stage: str # Produced, Surplus Identified, Quality Screened, Matched, Driver Assigned, Picked Up, Delivered
    timestamp: str
    actor: str
    notes: Optional[str] = None
    status: str

class TraceabilityResponse(BaseModel):
    traceability_id: str
    food_description: str
    quantity_kg: float
    portions: int
    kitchen_name: str
    receiver_name: Optional[str] = None
    events: List[TraceabilityTimelineEvent]
