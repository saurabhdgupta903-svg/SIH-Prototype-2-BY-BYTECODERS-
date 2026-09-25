import httpx
import math
import logging
from typing import List, Tuple, Dict, Any, Optional
from ..config import settings

logger = logging.getLogger(__name__)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula for great-circle distance."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

async def get_osrm_route(coordinates: List[Tuple[float, float]]) -> Dict[str, Any]:
    """
    Calls OSRM Route service with coordinates list [(lat, lng), ...].
    Note: OSRM expects longitude,latitude order!
    Returns total distance (km), duration (minutes), and GeoJSON route geometry.
    """
    if len(coordinates) < 2:
        return {"distance_km": 0.0, "duration_minutes": 0.0, "geometry": None}

    # Format for OSRM: lon,lat;lon,lat...
    coords_str = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
    url = f"{settings.OSRM_BASE_URL}/route/v1/driving/{coords_str}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    dist_km = round(route["distance"] / 1000.0, 2)
                    dur_min = round(route["duration"] / 60.0, 1)
                    geometry = route["geometry"]
                    return {
                        "distance_km": dist_km,
                        "duration_minutes": dur_min,
                        "geometry": geometry,
                        "source": "OSRM Routing Engine",
                        "is_fallback": False
                    }
    except Exception as e:
        logger.warning(f"OSRM call failed: {e}. Calculating geodesic path with synthetic polyline.")

    # Fallback: compute direct haversine distance and straight-line segments
    total_dist = 0.0
    for i in range(len(coordinates) - 1):
        total_dist += haversine_distance_km(
            coordinates[i][0], coordinates[i][1],
            coordinates[i+1][0], coordinates[i+1][1]
        )
    # Estimate road distance = 1.3x straight line, avg urban speed 25 km/h
    est_road_dist = round(total_dist * 1.28, 2)
    est_dur = round((est_road_dist / 24.0) * 60.0, 1)
    # Synthetic GeoJSON LineString coordinates: [lon, lat]
    geo_coords = [[lon, lat] for lat, lon in coordinates]

    return {
        "distance_km": est_road_dist,
        "duration_minutes": est_dur,
        "geometry": {
            "type": "LineString",
            "coordinates": geo_coords
        },
        "source": "Haversine Distance (Urban Factor 1.28x Fallback)",
        "is_fallback": True
    }

async def get_distance_matrix(coordinates: List[Tuple[float, float]]) -> List[List[float]]:
    """
    Computes a symmetric distance matrix in kilometers for OR-Tools routing.
    Calls OSRM Table service or falls back to Haversine matrix.
    """
    n = len(coordinates)
    if n <= 1:
        return [[0.0]]

    coords_str = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
    url = f"{settings.OSRM_BASE_URL}/table/v1/driving/{coords_str}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and "distances" in data:
                    matrix_meters = data["distances"]
                    # Convert to km
                    return [[round(cell / 1000.0, 2) if cell is not None else 999.0 for cell in row] for row in matrix_meters]
    except Exception as e:
        logger.warning(f"OSRM Table service failed: {e}. Using Haversine matrix fallback.")

    # Haversine matrix fallback with 1.28 road curvature multiplier
    matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            if i == j:
                row.append(0.0)
            else:
                dist = haversine_distance_km(coordinates[i][0], coordinates[i][1], coordinates[j][0], coordinates[j][1])
                row.append(round(dist * 1.28, 2))
        matrix.append(row)
    return matrix
