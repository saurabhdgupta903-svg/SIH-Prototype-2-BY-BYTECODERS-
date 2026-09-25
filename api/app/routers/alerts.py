from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from datetime import datetime
from ..database import get_db
from ..models.analytics import Alert, AlertSeverity

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

@router.get("/")
async def list_alerts(resolved: bool = False, db: AsyncSession = Depends(get_db)):
    stmt = select(Alert).where(Alert.is_resolved == resolved).order_by(Alert.created_at.desc())
    res = await db.execute(stmt)
    alerts = res.scalars().all()
    return [{
        "id": a.id,
        "alert_type": a.alert_type,
        "severity": a.severity.value,
        "title": a.title,
        "message": a.message,
        "action_url": a.action_url,
        "is_resolved": a.is_resolved,
        "created_at": a.created_at.isoformat()
    } for a in alerts]

@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    await db.commit()
    return {"status": "success", "message": f"Alert {alert_id} marked as resolved."}
