import pytest
import asyncio
from app.ml.receiver_matcher import receiver_matcher

@pytest.mark.asyncio
async def test_receiver_matching_scorer():
    surplus_item = {
        "estimated_portions": 45,
        "category": "Cooked Staples",
        "storage_temp_c": 63.5
    }
    candidates = [
        {
            "id": 1,
            "name": "Community Kitchen A",
            "receiver_type": "community_kitchen",
            "address": "Local St",
            "latitude": 18.5300,
            "longitude": 73.8450,
            "capacity_meals": 300,
            "has_cold_storage": True,
            "accepted_food_types": ["cooked_meals", "raw_produce"],
            "priority_level": 2,
            "operating_hours": "07:00-22:00"
        },
        {
            "id": 2,
            "name": "Far Shelter B",
            "receiver_type": "shelter",
            "address": "Distant St",
            "latitude": 18.4200,
            "longitude": 73.7500,
            "capacity_meals": 50,
            "has_cold_storage": False,
            "accepted_food_types": ["cooked_meals"],
            "priority_level": 1,
            "operating_hours": "08:00-20:00"
        }
    ]
    kitchen_coords = (18.5204, 73.8567)
    matches = await receiver_matcher.match_receivers(surplus_item, candidates, kitchen_coords)

    assert len(matches) == 2
    # Closer community kitchen with higher priority and cold storage should rank #1
    assert matches[0]["receiver_id"] == 1
    assert matches[0]["overall_score"] > matches[1]["overall_score"]
    assert "Ranked #1" in matches[0]["plain_language_reason"]
