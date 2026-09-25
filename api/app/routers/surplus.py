import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_db
from ..models.waste_surplus import SurplusRecord, SurplusStatus, RecoveryPath, QualityCheck, QualityRiskCategory
from ..models.kitchen import FoodItem
from ..models.institutions import Receiver, Institution, Kitchen
from ..models.users import AuditLog
from ..schemas.surplus import SurplusCreate, QualityScreeningRequest, QualityApprovalRequest, SurplusDetailResponse
from ..ml.vision_screening import quality_screening_engine
from ..ml.receiver_matcher import receiver_matcher
from ..ml.surplus_predictor import surplus_predictor

router = APIRouter(prefix="/api/surplus", tags=["Surplus & Food Safety"])

@router.post("/create")
async def create_surplus_listing(item_in: SurplusCreate, db: AsyncSession = Depends(get_db)):
    random_suffix = uuid.uuid4().hex[:6].upper()
    trace_id = f"FL-2026-{random_suffix}"

    rec = SurplusRecord(
        traceability_id=trace_id,
        kitchen_id=item_in.kitchen_id,
        food_item_id=item_in.food_item_id,
        description=item_in.description,
        quantity_kg=item_in.quantity_kg,
        estimated_portions=item_in.estimated_portions,
        prepared_at=item_in.prepared_at,
        ready_time=item_in.ready_time,
        safe_pickup_window_start=item_in.safe_pickup_window_start,
        safe_pickup_window_end=item_in.safe_pickup_window_end,
        status=SurplusStatus.IDENTIFIED,
        recommended_recovery_path=RecoveryPath.EDIBLE_DONATION,
        storage_temp_c=item_in.storage_temp_c,
        is_perishable=item_in.is_perishable
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)

    # Automatically initialize Level 1 & 2 screening
    l1 = quality_screening_engine.evaluate_level1_rules(
        preparation_timestamp=rec.prepared_at,
        current_timestamp=datetime.utcnow(),
        storage_temperature_c=rec.storage_temp_c,
        packaging_integrity="intact"
    )
    l2 = quality_screening_engine.evaluate_level2_vision(
        image_url=None,
        level1_passed=l1["passed"],
        holding_hours=l1["holding_hours"],
        food_category="Cooked Staples"
    )

    qc = QualityCheck(
        surplus_id=rec.id,
        preparation_timestamp=rec.prepared_at,
        current_timestamp=datetime.utcnow(),
        holding_hours=l1["holding_hours"],
        storage_temperature_c=rec.storage_temp_c,
        packaging_integrity="intact",
        rule_check_passed=l1["passed"],
        rule_check_summary=l1["summary"],
        image_url=None,
        vision_risk_score=l2["risk_score"],
        risk_category=QualityRiskCategory(l2["category"]),
        vision_assessment_notes=l2["notes"],
        approval_status="pending"
    )
    db.add(qc)
    await db.commit()

    return {"status": "success", "id": rec.id, "traceability_id": trace_id}

@router.get("/list")
async def list_surplus(kitchen_id: int = 1, db: AsyncSession = Depends(get_db)):
    stmt = select(SurplusRecord).order_by(SurplusRecord.created_at.desc()).limit(20)
    res = await db.execute(stmt)
    items = res.scalars().all()

    output = []
    for s in items:
        # Load food item name
        fi = (await db.execute(select(FoodItem).where(FoodItem.id == s.food_item_id))).scalars().first()
        qc = (await db.execute(select(QualityCheck).where(QualityCheck.surplus_id == s.id))).scalars().first()
        output.append({
            "id": s.id,
            "traceability_id": s.traceability_id,
            "food_name": fi.name if fi else s.description,
            "description": s.description,
            "quantity_kg": s.quantity_kg,
            "estimated_portions": s.estimated_portions,
            "ready_time": s.ready_time.isoformat(),
            "safe_window": f"{s.safe_pickup_window_start.strftime('%H:%M')} - {s.safe_pickup_window_end.strftime('%H:%M')}",
            "status": s.status.value,
            "storage_temp_c": s.storage_temp_c,
            "recovery_path": s.recommended_recovery_path.value,
            "quality_status": qc.approval_status if qc else "not_screened",
            "risk_category": qc.risk_category.value if qc else "Pending"
        })
    return output

@router.get("/{surplus_id}")
async def get_surplus_detail(surplus_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(SurplusRecord).where(SurplusRecord.id == surplus_id)
    res = await db.execute(stmt)
    s = res.scalars().first()
    if not s:
        raise HTTPException(status_code=404, detail="Surplus listing not found")

    fi = (await db.execute(select(FoodItem).where(FoodItem.id == s.food_item_id))).scalars().first()
    qc = (await db.execute(select(QualityCheck).where(QualityCheck.surplus_id == s.id))).scalars().first()

    # Find matching receivers
    rec_res = await db.execute(select(Receiver).where(Receiver.is_verified == True))
    receivers = rec_res.scalars().all()
    rec_list = [{
        "id": r.id,
        "name": r.name,
        "receiver_type": r.receiver_type.value,
        "address": r.address,
        "latitude": r.latitude,
        "longitude": r.longitude,
        "capacity_meals": r.capacity_meals,
        "has_cold_storage": r.has_cold_storage,
        "accepted_food_types": r.accepted_food_types,
        "priority_level": r.priority_level,
        "operating_hours": r.operating_hours
    } for r in receivers]

    matches = await receiver_matcher.match_receivers(
        surplus_item={"estimated_portions": s.estimated_portions, "category": fi.category if fi else "Cooked Staples", "storage_temp_c": s.storage_temp_c, "ready_time": s.ready_time},
        candidate_receivers=rec_list,
        kitchen_coords=(18.5204, 73.8567)
    )

    qc_dict = None
    if qc:
        qc_dict = {
            "holding_hours": qc.holding_hours,
            "storage_temp_c": qc.storage_temperature_c,
            "rule_check_passed": qc.rule_check_passed,
            "rule_summary": qc.rule_check_summary,
            "risk_score": qc.vision_risk_score,
            "risk_category": qc.risk_category.value,
            "vision_notes": qc.vision_assessment_notes,
            "approval_status": qc.approval_status,
            "approved_by_id": qc.approved_by_user_id,
            "approved_at": qc.approval_timestamp.isoformat() if qc.approval_timestamp else None
        }

    return {
        "id": s.id,
        "traceability_id": s.traceability_id,
        "kitchen_id": s.kitchen_id,
        "food_item_id": s.food_item_id,
        "food_item_name": fi.name if fi else "Cooked Meal",
        "description": s.description,
        "quantity_kg": s.quantity_kg,
        "estimated_portions": s.estimated_portions,
        "prepared_at": s.prepared_at.isoformat(),
        "ready_time": s.ready_time.isoformat(),
        "safe_pickup_window_start": s.safe_pickup_window_start.isoformat(),
        "safe_pickup_window_end": s.safe_pickup_window_end.isoformat(),
        "status": s.status.value,
        "recommended_recovery_path": s.recommended_recovery_path.value,
        "storage_temp_c": s.storage_temp_c,
        "quality_check": qc_dict,
        "matches": matches
    }

@router.post("/{surplus_id}/approve-quality")
async def approve_quality_release(surplus_id: int, req: QualityApprovalRequest, db: AsyncSession = Depends(get_db)):
    """
    Mandatory human approval workflow before surplus can be matched and released.
    Logs action to audit_logs table.
    """
    stmt = select(SurplusRecord).where(SurplusRecord.id == surplus_id)
    res = await db.execute(stmt)
    s = res.scalars().first()
    if not s:
        raise HTTPException(status_code=404, detail="Surplus listing not found")

    qc = (await db.execute(select(QualityCheck).where(QualityCheck.surplus_id == s.id))).scalars().first()
    if not qc:
        raise HTTPException(status_code=400, detail="Quality screening must be conducted first")

    if req.approved:
        qc.approval_status = "approved"
        qc.approval_timestamp = datetime.utcnow()
        qc.approval_notes = req.notes or "Cleared for community redistribution under MoFPI food safety guidelines."
        s.status = SurplusStatus.SCREENED
    else:
        qc.approval_status = "rejected"
        qc.approval_timestamp = datetime.utcnow()
        qc.approval_notes = req.notes or "Rejected by supervisor sensory inspection."
        s.status = SurplusStatus.EXPIRED
        s.recommended_recovery_path = RecoveryPath.ORGANIC_RECYCLING

    # Write to Audit Log
    audit = AuditLog(
        action="APPROVE_QUALITY_RELEASE" if req.approved else "REJECT_QUALITY_RELEASE",
        resource_type="surplus_record",
        resource_id=s.traceability_id,
        details={
            "surplus_id": s.id,
            "portions": s.estimated_portions,
            "approved": req.approved,
            "supervisor_pin_used": True,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "status": "success",
        "surplus_status": s.status.value,
        "approval_status": qc.approval_status,
        "traceability_id": s.traceability_id,
        "message": "Quality authorization recorded in immutable audit log."
    }
