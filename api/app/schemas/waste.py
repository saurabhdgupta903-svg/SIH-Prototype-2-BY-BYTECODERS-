from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.waste_surplus import WasteReason

class WasteCreate(BaseModel):
    kitchen_id: int
    food_item_id: int
    quantity_kg: float
    reason: Optional[WasteReason] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    client_offline_id: Optional[str] = None
    recorded_at: Optional[datetime] = None

class WasteBatchSync(BaseModel):
    records: List[WasteCreate]

class WasteResponse(BaseModel):
    id: int
    kitchen_id: int
    food_item_id: int
    food_item_name: Optional[str] = None
    quantity_kg: float
    reason: str
    notes: Optional[str] = None
    client_offline_id: Optional[str] = None
    recorded_at: datetime
    synced_at: datetime

    class Config:
        from_attributes = True

class WasteAnalysisResponse(BaseModel):
    total_waste_kg: float
    by_food_item: List[Dict[str, Any]] # [{"name": "Cooked Rice", "quantity_kg": 42.5, "percentage": 34.0}]
    by_reason: List[Dict[str, Any]]    # [{"reason": "overproduction", "quantity_kg": 55.0, "percentage": 44.0}]
    primary_cause: str
    actionable_recommendations: List[str]
    is_simulated: bool = True
