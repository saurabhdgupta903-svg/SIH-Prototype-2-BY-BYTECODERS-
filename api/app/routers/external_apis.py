from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List, Optional
from ..database import get_db
from ..models.institutions import Receiver
from ..services.weather_service import get_kitchen_weather, get_air_quality
from ..services.geocoding_service import geocode_address
from ..services.overpass_service import query_overpass_receivers

router = APIRouter(prefix="/api/external", tags=["External APIs & Discovery"])

@router.get("/weather")
async def fetch_weather(lat: Optional[float] = None, lng: Optional[float] = None):
    kwargs = {}
    if lat is not None and lng is not None:
        kwargs = {"lat": lat, "lng": lng}
    return await get_kitchen_weather(**kwargs)

@router.get("/air-quality")
async def fetch_air_quality(lat: Optional[float] = None, lng: Optional[float] = None):
    kwargs = {}
    if lat is not None and lng is not None:
        kwargs = {"lat": lat, "lng": lng}
    return await get_air_quality(**kwargs)

@router.get("/geocode")
async def geocode_query(q: str = Query(..., description="Address or locality to geocode")):
    coords = await geocode_address(q)
    if not coords:
        raise HTTPException(status_code=404, detail=f"Coordinates not found for address: {q}")
    return {
        "query": q,
        "latitude": coords[0],
        "longitude": coords[1],
        "source": "OpenStreetMap Nominatim Geocoding API"
    }

@router.get("/discover-receivers")
async def discover_receivers(
    lat: float = 18.5204,
    lng: float = 73.8567,
    radius_km: float = 15.0,
    db: AsyncSession = Depends(get_db)
):
    """
    Overpass API receiver discovery: imports social facilities (food banks, shelters, community centres).
    Admin imports them as receivers with "verified: no" until manually verified.
    """
    results = await query_overpass_receivers(lat, lng, radius_km)
    return {
        "count": len(results),
        "receivers": results,
        "source": "OpenStreetMap Overpass API"
    }

@router.get("/receivers")
async def list_receivers(verified_only: bool = False, db: AsyncSession = Depends(get_db)):
    stmt = select(Receiver)
    if verified_only:
        stmt = stmt.where(Receiver.is_verified == True)
    res = await db.execute(stmt)
    receivers = res.scalars().all()
    return [{
        "id": r.id,
        "name": r.name,
        "receiver_type": r.receiver_type.value,
        "address": r.address,
        "city": r.city,
        "latitude": r.latitude,
        "longitude": r.longitude,
        "capacity_meals": r.capacity_meals,
        "has_cold_storage": r.has_cold_storage,
        "is_verified": r.is_verified,
        "source": r.source,
        "priority_level": r.priority_level,
        "contact_person": r.contact_person,
        "contact_phone": r.contact_phone
    } for r in receivers]

@router.post("/verify-receiver/{receiver_id}")
async def toggle_receiver_verification(receiver_id: int, verified: bool = True, db: AsyncSession = Depends(get_db)):
    stmt = select(Receiver).where(Receiver.id == receiver_id)
    res = await db.execute(stmt)
    r = res.scalars().first()
    if not r:
        raise HTTPException(status_code=404, detail="Receiver not found")

    r.is_verified = verified
    await db.commit()
    return {
        "status": "success",
        "receiver_id": r.id,
        "name": r.name,
        "is_verified": r.is_verified,
        "message": f"Receiver verification status set to {verified}."
    }
