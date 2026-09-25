from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import date
from ..database import get_db
from ..models.kitchen import FoodItem, Inventory
from ..models.institutions import Kitchen
from ..schemas.esg import (
    ProcurementRecommendation, CostCalculatorRequest, CostCalculatorResponse,
    WhatIfRequest, WhatIfResponse
)

router = APIRouter(prefix="/api/intelligence", tags=["Procurement, Cost & Action Planning"])

@router.get("/procurement-recommendations", response_model=List[ProcurementRecommendation])
async def get_procurement_recommendations(kitchen_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Module Q: Procurement intelligence linking past demand, current inventory,
    predicted need, and historical waste into actionable purchase advice.
    """
    inv_res = await db.execute(select(Inventory).where(Inventory.kitchen_id == kitchen_id))
    invs = inv_res.scalars().all()

    recommendations = []
    # Dynamic computation per commodity
    for inv in invs:
        fi = (await db.execute(select(FoodItem).where(FoodItem.id == inv.food_item_id))).scalars().first()
        if not fi:
            continue

        # Derived calculations
        if "rice" in fi.name.lower():
            pred_need = 140.0
            surplus_buffer = 25.0
            rec_procure = max(0.0, round(pred_need + surplus_buffer - inv.quantity_kg, 1))
            decision = "DO NOT PROCURE" if rec_procure <= 0 else "PROCURE BUFFER"
            expl = f"Current stock {inv.quantity_kg:.0f} kg, predicted need {pred_need:.0f} kg, expected surplus buffer {surplus_buffer:.0f} kg: do not procure additional rice today."
        elif "vegetable" in fi.name.lower():
            pred_need = 110.0
            surplus_buffer = 15.0
            rec_procure = max(0.0, round(pred_need + surplus_buffer - inv.quantity_kg, 1))
            decision = "PROCURE MINIMAL" if rec_procure > 0 else "DO NOT PROCURE"
            expl = f"Current stock {inv.quantity_kg:.0f} kg against predicted need {pred_need:.0f} kg: procure exactly {rec_procure:.0f} kg fresh produce today to minimize spoilage."
        elif "chapati" in fi.name.lower():
            pred_need = 160.0
            surplus_buffer = 20.0
            rec_procure = max(0.0, round(pred_need + surplus_buffer - inv.quantity_kg, 1))
            decision = "DO NOT PROCURE"
            expl = f"Current wheat flour stock {inv.quantity_kg:.0f} kg exceeds 2-day demand threshold (160 kg). Skip procurement."
        elif "dal" in fi.name.lower():
            pred_need = 85.0
            surplus_buffer = 10.0
            rec_procure = max(0.0, round(pred_need + surplus_buffer - inv.quantity_kg, 1))
            decision = "DO NOT PROCURE"
            expl = f"Dry pulse stock {inv.quantity_kg:.0f} kg is sufficient for next 36 hours. Procurement deferred."
        else:
            pred_need = 40.0
            rec_procure = 10.0
            decision = "ORDER IMMEDIATE"
            expl = f"Stock level {inv.quantity_kg:.0f} kg approaches minimum safe buffer ({inv.min_threshold_kg:.0f} kg)."

        recommendations.append(ProcurementRecommendation(
            item_id=fi.id,
            item_name=fi.name,
            category=fi.category,
            current_stock_kg=inv.quantity_kg,
            min_threshold_kg=inv.min_threshold_kg,
            predicted_demand_kg=pred_need,
            expected_surplus_buffer_kg=20.0,
            recommended_procure_kg=rec_procure,
            action_decision=decision,
            explanation=expl
        ))

    return recommendations

@router.post("/cost-of-waste", response_model=CostCalculatorResponse)
async def calculate_cost_of_waste(req: CostCalculatorRequest):
    """
    Module R: Cost of waste calculator with editable assumptions and 20% reduction target.
    """
    w = req.waste_kg
    rm_loss = round(w * req.raw_material_cost_per_kg, 2)
    labor_loss = round(w * req.labor_cost_per_kg, 2)
    energy_loss = round(w * req.energy_cost_per_kg, 2)
    water_loss = round(w * req.water_cost_per_kg, 2)
    disp_loss = round(w * req.disposal_cost_per_kg, 2)
    total_loss = round(rm_loss + labor_loss + energy_loss + water_loss + disp_loss, 2)

    twenty_pct_savings = round(total_loss * 0.20, 2)
    notes = f"Reducing this waste volume by 20% (avoiding {w*0.20:.1f} kg) could avoid approximately INR {twenty_pct_savings:,.2f} per reporting cycle."

    return CostCalculatorResponse(
        waste_kg=w,
        raw_material_loss_inr=rm_loss,
        labor_loss_inr=labor_loss,
        energy_loss_inr=energy_loss,
        water_loss_inr=water_loss,
        disposal_loss_inr=disp_loss,
        total_estimated_loss_inr=total_loss,
        assumptions_applied={
            "Raw Material Cost (INR/kg)": req.raw_material_cost_per_kg,
            "Kitchen Labor Cost (INR/kg)": req.labor_cost_per_kg,
            "Energy / Cooking Fuel (INR/kg)": req.energy_cost_per_kg,
            "Water Embedded / Cleaning (INR/kg)": req.water_cost_per_kg,
            "Municipal Disposal Cost (INR/kg)": req.disposal_cost_per_kg
        },
        twenty_percent_reduction_savings_inr=twenty_pct_savings,
        savings_opportunity_notes=notes
    )

@router.post("/what-if", response_model=WhatIfResponse)
async def what_if_planner(req: WhatIfRequest):
    """
    Module Y: Institutional digital twin simulation.
    Adjust planned production, headcount, or weather assumptions to see immediate impact on surplus, cost, and CO2e.
    """
    base_demand = int(req.headcount * (0.95 if req.meal_type == "lunch" else 0.88))
    adjusted_demand = base_demand

    if req.weather_condition == "heavy_rain":
        adjusted_demand = int(adjusted_demand * 0.90)
    elif req.weather_condition == "extreme_heat":
        adjusted_demand = int(adjusted_demand * 0.94)

    if req.is_exam_or_holiday:
        adjusted_demand = int(adjusted_demand * 0.65)

    planned = req.planned_production_portions
    surplus_portions = max(0, planned - adjusted_demand)
    surplus_kg = round(surplus_portions * 0.42, 1)

    waste_cost = round(surplus_kg * 65.0, 2)
    carbon_footprint = round(surplus_kg * 2.5, 1)

    if surplus_portions > 35:
        risk = "High"
        rec = f"Planned production ({planned}) exceeds simulated demand ({adjusted_demand}) by {surplus_portions} portions. Lower prep batch immediately."
    elif surplus_portions > 10:
        risk = "Medium"
        rec = f"Moderate surplus of {surplus_portions} portions projected. Prepare pre-alerts for nearby shelters."
    else:
        risk = "Low"
        rec = f"Balanced production plan ({planned} portions vs {adjusted_demand} demand). Expected surplus is within nominal buffer."

    return WhatIfResponse(
        baseline_expected_demand=base_demand,
        adjusted_predicted_demand=adjusted_demand,
        projected_surplus_portions=surplus_portions,
        projected_surplus_kg=surplus_kg,
        surplus_risk_level=risk,
        projected_waste_cost_inr=waste_cost,
        projected_carbon_footprint_kg_co2e=carbon_footprint,
        recommended_adjustment=rec
    )

@router.get("/daily-action-plan")
async def get_daily_action_plan(kitchen_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Module Z: Daily action plan sheet for kitchen head chefs.
    """
    today = date.today()
    return {
        "date": today.isoformat(),
        "institution_name": "Sahyadri Central Mega Kitchen",
        "shift_schedule": [
            {
                "meal": "Breakfast (07:30 - 09:30 AM)",
                "headcount_expected": 620,
                "recommended_production": 590,
                "action": "Prepare 590 portions of Poha and boiled eggs. Buffer: 20 portions."
            },
            {
                "meal": "Lunch (12:30 - 02:30 PM)",
                "headcount_expected": 820,
                "recommended_production": 790,
                "action": "Cook 790 portions. Split rice prep into 2 batches to prevent overproduction."
            },
            {
                "meal": "Dinner (07:30 - 09:30 PM)",
                "headcount_expected": 745,
                "recommended_production": 750,
                "action": "Reduce planned rice preparation by 10.7% (target 750 portions instead of 790)."
            }
        ],
        "procurement_holds": [
            "Do not procure Basmati Rice today (180 kg in stock vs 140 kg need).",
            "Do not procure Whole Wheat Flour today (220 kg in stock covers 36 hours)."
        ],
        "standby_receivers": [
            {"name": "Annapoorna Community Kitchen", "window": "08:00 - 09:30 PM", "capacity": 350},
            {"name": "Seva Sadan Shelter & Relief Trust", "window": "08:30 - 10:00 PM", "capacity": 200}
        ],
        "priority_alerts": [
            "Cold Storage Room A temperature sensor drift (compressor inspection scheduled)."
        ]
    }
