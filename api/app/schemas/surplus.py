from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SurplusCreate(BaseModel):
    kitchen_id: int
    food_item_id: int
    description: str
    quantity_kg: float
    estimated_portions: int
    prepared_at: datetime
    ready_time: datetime
    safe_pickup_window_start: datetime
    safe_pickup_window_end: datetime
    storage_temp_c: float = 65.0
    is_perishable: bool = True

class QualityScreeningRequest(BaseModel):
    surplus_id: int
    storage_temp_c: float
    packaging_integrity: str = "intact"
    image_url: Optional[str] = None
    notes: Optional[str] = None

class QualityApprovalRequest(BaseModel):
    approved: bool
    notes: Optional[str] = None
    supervisor_pin: str

class MatchScoreBreakdown(BaseModel):
    receiver_id: int
    receiver_name: str
    receiver_type: str
    address: str
    latitude: float
    longitude: float
    distance_km: float
    eta_minutes: float
    overall_score: float
    food_compatibility_score: float
    quantity_fit_score: float
    storage_capability_score: float
    urgency_score: float
    plain_language_reason: str
    operating_hours: str
    has_cold_storage: bool

class SurplusDetailResponse(BaseModel):
    id: int
    traceability_id: str
    kitchen_id: int
    food_item_id: int
    food_item_name: str
    description: str
    quantity_kg: float
    estimated_portions: int
    prepared_at: datetime
    ready_time: datetime
    safe_pickup_window_start: datetime
    safe_pickup_window_end: datetime
    status: str
    recommended_recovery_path: str
    storage_temp_c: float
    quality_check: Optional[Dict[str, Any]] = None
    matches: List[MatchScoreBreakdown] = []
    created_at: datetime

    class Config:
        from_attributes = True
