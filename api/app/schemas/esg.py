from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CostCalculatorRequest(BaseModel):
    waste_kg: float
    raw_material_cost_per_kg: float = 65.0 # INR
    labor_cost_per_kg: float = 18.0        # INR
    energy_cost_per_kg: float = 8.5        # INR
    water_cost_per_kg: float = 3.2         # INR
    disposal_cost_per_kg: float = 4.0      # INR

class CostCalculatorResponse(BaseModel):
    waste_kg: float
    raw_material_loss_inr: float
    labor_loss_inr: float
    energy_loss_inr: float
    water_loss_inr: float
    disposal_loss_inr: float
    total_estimated_loss_inr: float
    assumptions_applied: Dict[str, float]
    twenty_percent_reduction_savings_inr: float
    savings_opportunity_notes: str

class WhatIfRequest(BaseModel):
    kitchen_id: int
    meal_type: str = "lunch"
    planned_production_portions: int
    headcount: int
    weather_condition: str = "normal" # normal, heavy_rain, extreme_heat
    is_exam_or_holiday: bool = False

class WhatIfResponse(BaseModel):
    baseline_expected_demand: int
    adjusted_predicted_demand: int
    projected_surplus_portions: int
    projected_surplus_kg: float
    surplus_risk_level: str
    projected_waste_cost_inr: float
    projected_carbon_footprint_kg_co2e: float
    recommended_adjustment: str

class ProcurementRecommendation(BaseModel):
    item_id: int
    item_name: str
    category: str
    current_stock_kg: float
    min_threshold_kg: float
    predicted_demand_kg: float
    expected_surplus_buffer_kg: float
    recommended_procure_kg: float
    action_decision: str # "DO NOT PROCURE", "PROCURE MINIMAL", "ORDER IMMEDIATE"
    explanation: str

class CitationItem(BaseModel):
    factor_name: str
    value: float
    unit: str
    source: str
    notes: Optional[str] = None

class ESGReportData(BaseModel):
    institution_name: str
    reporting_period: str
    waste_prevented_kg: float
    surplus_redistributed_kg: float
    meals_served_to_community: int
    co2e_emissions_avoided_kg: float
    water_conserved_litres: float
    financial_value_reclaimed_inr: float
    monthly_trend: List[Dict[str, Any]]
    citations: List[CitationItem]
    is_simulated: bool = True
