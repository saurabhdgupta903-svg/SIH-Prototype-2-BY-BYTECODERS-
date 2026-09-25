import pytest
from app.ml.route_optimizer import optimize_delivery_route

@pytest.mark.asyncio
async def test_route_optimizer():
    depot = (18.5204, 73.8567)
    stops = [
        {"receiver_id": 1, "name": "Annapoorna Kitchen", "lat": 18.5314, "lng": 73.8446, "demand_kg": 19.5, "demand_portions": 45},
        {"receiver_id": 2, "name": "Seva Sadan", "lat": 18.5122, "lng": 73.8519, "demand_kg": 10.0, "demand_portions": 20}
    ]

    result = await optimize_delivery_route(depot, "Sahyadri Kitchen", stops)
    assert result["total_distance_km"] > 0
    assert result["estimated_duration_minutes"] > 0
    assert len(result["stops"]) == 3 # Depot + 2 dropoffs
    assert result["stops"][0]["stop_type"] == "pickup"
    assert result["stops"][1]["stop_type"] == "dropoff"
