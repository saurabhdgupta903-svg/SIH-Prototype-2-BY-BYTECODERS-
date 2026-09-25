import httpx
import asyncio
import time
import logging
from typing import Optional, Tuple, Dict, Any
from ..config import settings

logger = logging.getLogger(__name__)

# Cache for geocoded queries
_geocode_cache: Dict[str, Tuple[float, float]] = {
    "pune": (18.5204, 73.8567),
    "mumbai": (19.0760, 72.8777),
    "nashik": (19.9975, 73.7898),
    "nagpur": (21.1458, 79.0882),
}

_last_request_time = 0.0
_lock = asyncio.Lock()

async def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocodes an address to (latitude, longitude) using Nominatim.
    Enforces the 1 request/second Nominatim usage policy, custom User-Agent, and in-memory cache.
    """
    clean_addr = address.strip().lower()
    if clean_addr in _geocode_cache:
        return _geocode_cache[clean_addr]

    global _last_request_time
    async with _lock:
        elapsed = time.time() - _last_request_time
        if elapsed < 1.05:
            await asyncio.sleep(1.05 - elapsed)

        headers = {
            "User-Agent": "FoodLoop-MoFPI-SIH26234/1.0 (https://foodloop.mofpi.gov.in; admin@foodloop.gov.in)"
        }
        params = {
            "q": address,
            "format": "json",
            "limit": 1
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{settings.NOMINATIM_BASE_URL}/search", params=params, headers=headers)
                _last_request_time = time.time()
                if resp.status_code == 200:
                    data = resp.json()
                    if data and len(data) > 0:
                        lat = float(data[0]["lat"])
                        lon = float(data[0]["lon"])
                        _geocode_cache[clean_addr] = (lat, lon)
                        return (lat, lon)
        except Exception as e:
            logger.warning(f"Nominatim geocoding error for '{address}': {e}")
            _last_request_time = time.time()

    # Fallback to demo center if geocoding fails
    return (settings.DEMO_INSTITUTION_LAT, settings.DEMO_INSTITUTION_LNG)
