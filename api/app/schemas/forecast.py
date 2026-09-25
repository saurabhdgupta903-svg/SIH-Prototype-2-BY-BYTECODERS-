from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date

class ForecastRequest(BaseModel):
    kitchen_id: int
    target_date: date
    meal_type: str # breakfast, lunch, dinner
    headcount: Optional[int] = None
    planned_production_portions: Optional[int] = None

class MealForecast(BaseModel):
    meal_type: str
    target_date: date
    predicted_demand_portions: int
    prediction_interval_lower: int
    prediction_interval_upper: int
    recommended_production_portions: int
    planned_production_portions: int
    predicted_surplus_portions: int
    surplus_risk_level: str # Low, Medium, High
    action_recommendation: str
    temperature_c: Optional[float] = None
    precipitation_mm: Optional[float] = None

class DashboardSummaryResponse(BaseModel):
    date: date
    total_expected_demand: int
    total_recommended_production: int
    total_current_production: int
    total_predicted_surplus_min: int
    total_predicted_surplus_max: int
    food_at_risk_kg: float
    waste_this_week_kg: float
    waste_last_week_kg: float
    waste_percentage_change: float
    action_list: List[str]
    meals: List[MealForecast]
    with_vs_without: Dict[str, Any]
    is_simulated: bool = True

class ModelBenchmarkResponse(BaseModel):
    model_name: str
    baseline_model_name: str
    production_mae: float
    baseline_mae: float
    production_mape_percent: float
    baseline_mape_percent: float
    held_out_samples_count: int
    training_period: str
    last_retrained_at: str
    features_used: List[str]
    is_simulated: bool = True
