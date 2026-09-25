import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from ..config import settings

logger = logging.getLogger(__name__)

# In-memory cache to prevent excessive requests
_weather_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = timedelta(minutes=30)

async def get_kitchen_weather(lat: float = settings.DEMO_INSTITUTION_LAT, lng: float = settings.DEMO_INSTITUTION_LNG) -> Dict[str, Any]:
    """
    Fetches real-time weather and precipitation forecast from Open-Meteo API.
    Caches responses and falls back to seasonal climate defaults if unreachable.
    """
    cache_key = f"{round(lat, 3)}_{round(lng, 3)}"
    now = datetime.utcnow()

    if cache_key in _weather_cache:
        cached = _weather_cache[cache_key]
        if now - cached["timestamp"] < CACHE_TTL:
            return cached["data"]

    url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "rain", "weather_code", "wind_speed_10m"],
        "hourly": ["temperature_2m", "precipitation_probability"],
        "timezone": "auto",
        "forecast_days": 1
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                result = {
                    "temperature_c": current.get("temperature_2m", 28.5),
                    "humidity_pct": current.get("relative_humidity_2m", 62),
                    "precipitation_mm": current.get("precipitation", 0.0),
                    "wind_speed_kmh": current.get("wind_speed_10m", 12.0),
                    "weather_code": current.get("weather_code", 0),
                    "condition": "Clear / Normal" if current.get("precipitation", 0.0) == 0 else "Rainy",
                    "source": "Open-Meteo Forecast API (Real-time)",
                    "is_fallback": False,
                    "last_updated": now.isoformat()
                }
                _weather_cache[cache_key] = {"data": result, "timestamp": now}
                return result
    except Exception as e:
        logger.warning(f"Open-Meteo call failed: {e}. Using regional seasonal fallback.")

    # Graceful fallback
    fallback_data = {
        "temperature_c": 28.5,
        "humidity_pct": 60,
        "precipitation_mm": 0.0,
        "wind_speed_kmh": 10.0,
        "weather_code": 0,
        "condition": "Dry & Moderate (Fallback)",
        "source": "Indian Meteorological Norms (Fallback Constant)",
        "is_fallback": True,
        "last_updated": now.isoformat()
    }
    return fallback_data

async def get_air_quality(lat: float = settings.DEMO_INSTITUTION_LAT, lng: float = settings.DEMO_INSTITUTION_LNG) -> Dict[str, Any]:
    """Optional Open-Meteo Air Quality panel."""
    url = f"{settings.OPEN_METEO_AIR_QUALITY_URL}/air-quality"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": ["european_aqi", "pm10", "pm2_5"],
        "timezone": "auto"
    }
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json().get("current", {})
                return {
                    "aqi": data.get("european_aqi", 42),
                    "pm2_5": data.get("pm2_5", 22.4),
                    "pm10": data.get("pm10", 45.1),
                    "source": "Open-Meteo Air Quality API",
                    "is_fallback": False
                }
    except Exception:
        pass
    return {"aqi": 45, "pm2_5": 25.0, "pm10": 50.0, "source": "Regional Air Baseline", "is_fallback": True}
