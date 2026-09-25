from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from datetime import datetime
from ..database import get_db
from ..models.waste_surplus import WasteRecord, WasteReason
from ..models.kitchen import FoodItem
from ..schemas.waste import WasteCreate, WasteBatchSync, WasteResponse, WasteAnalysisResponse
from ..ml.waste_text_classifier import classify_waste_text

router = APIRouter(prefix="/api/waste", tags=["Waste Recording & Analysis"])

@router.post("/classify-note")
async def classify_note_endpoint(payload: Dict[str, str]):
    note = payload.get("note", "")
    reason = classify_waste_text(note)
    return {"classified_reason": reason.value}

@router.post("/record", response_model=WasteResponse)
async def record_waste(waste_in: WasteCreate, db: AsyncSession = Depends(get_db)):
    # Auto-classify reason if missing or other and notes exist
    reason = waste_in.reason
    if (not reason or reason == WasteReason.OTHER) and waste_in.notes:
        reason = classify_waste_text(waste_in.notes)
    elif not reason:
        reason = WasteReason.OVERPRODUCTION

    # Deduplicate by client_offline_id if provided
    if waste_in.client_offline_id:
        stmt = select(WasteRecord).where(WasteRecord.client_offline_id == waste_in.client_offline_id)
        res = await db.execute(stmt)
        existing = res.scalars().first()
        if existing:
            return existing

    rec = WasteRecord(
        kitchen_id=waste_in.kitchen_id,
        food_item_id=waste_in.food_item_id,
        quantity_kg=waste_in.quantity_kg,
        reason=reason,
        notes=waste_in.notes,
        photo_url=waste_in.photo_url,
        client_offline_id=waste_in.client_offline_id,
        recorded_at=waste_in.recorded_at or datetime.utcnow(),
        synced_at=datetime.utcnow()
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)

    # Fetch food item name
    fi_res = await db.execute(select(FoodItem).where(FoodItem.id == rec.food_item_id))
    fi = fi_res.scalars().first()

    return WasteResponse(
        id=rec.id,
        kitchen_id=rec.kitchen_id,
        food_item_id=rec.food_item_id,
        food_item_name=fi.name if fi else "General Food Item",
        quantity_kg=rec.quantity_kg,
        reason=rec.reason.value,
        notes=rec.notes,
        client_offline_id=rec.client_offline_id,
        recorded_at=rec.recorded_at,
        synced_at=rec.synced_at
    )

@router.post("/batch-sync")
async def batch_sync_waste(batch: WasteBatchSync, db: AsyncSession = Depends(get_db)):
    """
    Offline sync endpoint: receives array of locally queued records.
    Deduplicates using client_offline_id.
    """
    synced_count = 0
    duplicate_count = 0

    for item in batch.records:
        if item.client_offline_id:
            stmt = select(WasteRecord).where(WasteRecord.client_offline_id == item.client_offline_id)
            res = await db.execute(stmt)
            if res.scalars().first():
                duplicate_count += 1
                continue

        reason = item.reason or (classify_waste_text(item.notes) if item.notes else WasteReason.OVERPRODUCTION)
        rec = WasteRecord(
            kitchen_id=item.kitchen_id,
            food_item_id=item.food_item_id,
            quantity_kg=item.quantity_kg,
            reason=reason,
            notes=item.notes,
            photo_url=item.photo_url,
            client_offline_id=item.client_offline_id,
            recorded_at=item.recorded_at or datetime.utcnow(),
            synced_at=datetime.utcnow()
        )
        db.add(rec)
        synced_count += 1

    await db.commit()
    return {
        "status": "success",
        "synced_records": synced_count,
        "duplicates_skipped": duplicate_count,
        "message": f"Successfully synchronised {synced_count} offline records."
    }

@router.get("/analysis", response_model=WasteAnalysisResponse)
async def get_waste_analysis(kitchen_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Detailed waste analysis: breakdown by food item and by cause,
    primary cause, and actionable data-derived recommendations.
    """
    # Breakdown by food item (demo realistic distribution)
    by_item = [
        {"name": "Cooked Basmati / Kolam Rice", "quantity_kg": 38.5, "percentage": 35.2},
        {"name": "Mixed Seasonal Vegetable Curry", "quantity_kg": 27.0, "percentage": 24.7},
        {"name": "Whole Wheat Chapati", "quantity_kg": 22.4, "percentage": 20.5},
        {"name": "Toor Dal Tadka", "quantity_kg": 15.6, "percentage": 14.3},
        {"name": "Dairy / Curd", "quantity_kg": 5.8, "percentage": 5.3}
    ]

    by_reason = [
        {"reason": "Overproduction", "quantity_kg": 46.8, "percentage": 42.8},
        {"reason": "Plate Waste", "quantity_kg": 26.2, "percentage": 24.0},
        {"reason": "Preparation Waste", "quantity_kg": 18.5, "percentage": 16.9},
        {"reason": "Low Demand / Weather", "quantity_kg": 12.0, "percentage": 11.0},
        {"reason": "Storage & Spoilage", "quantity_kg": 5.8, "percentage": 5.3}
    ]

    tot = sum(i["quantity_kg"] for i in by_item)

    recommendations = [
        "Primary cause is Overproduction (42.8%), heavily concentrated in Cooked Rice (35.2%).",
        "Data-derived action: Adjust rice batch cooking to 2 phases (first batch at 11:30 AM, second batch triggered only if 65% consumed by 12:45 PM).",
        "Chapati production can be reduced by 8% on Friday and Saturday dinner shifts based on student attendance patterns."
    ]

    return WasteAnalysisResponse(
        total_waste_kg=round(tot, 1),
        by_food_item=by_item,
        by_reason=by_reason,
        primary_cause="Overproduction during Dinner Shifts",
        actionable_recommendations=recommendations,
        is_simulated=True
    )
