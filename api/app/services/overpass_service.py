import httpx
import logging
from typing import List, Dict, Any
from ..config import settings

logger = logging.getLogger(__name__)

# Fallback verified and unverified receivers in Pune / Maharashtra corridor
FALLBACK_RECEIVERS: List[Dict[str, Any]] = [
    {
        "name": "Annapoorna Community Kitchen Pune",
        "receiver_type": "community_kitchen",
        "address": "Shivajinagar, Pune, Maharashtra 411005",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5314,
        "longitude": 73.8446,
        "contact_person": "Sunita Patil",
        "contact_phone": "+91 98220 12345",
        "operating_hours": "07:00-21:30",
        "capacity_meals": 350,
        "has_cold_storage": True,
        "accepted_food_types": ["cooked_meals", "raw_produce"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 2
    },
    {
        "name": "Seva Sadan Shelter & Relief Trust",
        "receiver_type": "shelter",
        "address": "Sadashiv Peth, Pune, Maharashtra 411030",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5122,
        "longitude": 73.8519,
        "contact_person": "Ramesh Deshmukh",
        "contact_phone": "+91 94220 54321",
        "operating_hours": "08:00-22:00",
        "capacity_meals": 200,
        "has_cold_storage": False,
        "accepted_food_types": ["cooked_meals", "packaged"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 2
    },
    {
        "name": "Roti Bank Maharashtra - Kothrud Node",
        "receiver_type": "food_bank",
        "address": "Paud Road, Kothrud, Pune, Maharashtra 411038",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5074,
        "longitude": 73.8077,
        "contact_person": "Anil Kulkarni",
        "contact_phone": "+91 98901 88776",
        "operating_hours": "09:00-21:00",
        "capacity_meals": 500,
        "has_cold_storage": True,
        "accepted_food_types": ["cooked_meals", "raw_produce", "packaged"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 1
    },
    {
        "name": "Aashray Homeless Care Centre",
        "receiver_type": "shelter",
        "address": "Hadapsar Industrial Area, Pune 411028",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.4967,
        "longitude": 73.9417,
        "contact_person": "Sister Teresa Rao",
        "contact_phone": "+91 97654 33221",
        "operating_hours": "10:00-20:00",
        "capacity_meals": 150,
        "has_cold_storage": False,
        "accepted_food_types": ["cooked_meals"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 2
    },
    {
        "name": "MahaBio Organic Composting Facility",
        "receiver_type": "organic_recycler",
        "address": "Uruli Devachi Solid Waste Buffer Zone, Pune 412308",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.4612,
        "longitude": 73.9628,
        "contact_person": "Dr. Vikas Joshi",
        "contact_phone": "+91 98811 77654",
        "operating_hours": "06:00-18:00",
        "capacity_meals": 2000,
        "has_cold_storage": False,
        "accepted_food_types": ["raw_produce", "cooked_meals", "preparation_waste"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 1
    },
    {
        "name": "Kisan Cattle & Animal Rescue Feed Depot",
        "receiver_type": "animal_feed_shelter",
        "address": "Manjari Farm Rd, Pune 412307",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5245,
        "longitude": 73.9812,
        "contact_person": "Gopal Shinde",
        "contact_phone": "+91 99220 99881",
        "operating_hours": "07:00-19:00",
        "capacity_meals": 800,
        "has_cold_storage": False,
        "accepted_food_types": ["raw_produce", "grains"],
        "is_verified": True,
        "source": "manual",
        "priority_level": 1
    }
]

async def query_overpass_receivers(lat: float, lng: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """
    Queries real nearby social facilities (food banks, shelters, community centres)
    using the OpenStreetMap Overpass API. Results are imported with is_verified = False.
    """
    radius_meters = int(radius_km * 1000)
    query = f"""
    [out:json][timeout:10];
    (
      node["social_facility"~"food_bank|soup_kitchen|shelter"](around:{radius_meters},{lat},{lng});
      node["amenity"="community_centre"](around:{radius_meters},{lat},{lng});
    );
    out body 15;
    """

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(settings.OVERPASS_API_URL, data={"data": query})
            if resp.status_code == 200:
                elements = resp.json().get("elements", [])
                results = []
                for el in elements:
                    tags = el.get("tags", {})
                    name = tags.get("name") or tags.get("description") or f"Community Centre ({el.get('id')})"
                    soc_fac = tags.get("social_facility", "")
                    amenity = tags.get("amenity", "")

                    if soc_fac == "food_bank":
                        rtype = "food_bank"
                    elif soc_fac in ["shelter", "soup_kitchen"]:
                        rtype = "shelter"
                    else:
                        rtype = "community_kitchen"

                    results.append({
                        "name": name,
                        "receiver_type": rtype,
                        "address": tags.get("addr:street", tags.get("addr:suburb", "Local Vicinity")),
                        "city": tags.get("addr:city", settings.DEMO_INSTITUTION_CITY),
                        "state": settings.DEMO_INSTITUTION_STATE,
                        "latitude": el["lat"],
                        "longitude": el["lon"],
                        "contact_person": tags.get("operator", "Community Coordinator"),
                        "contact_phone": tags.get("phone", "+91 20 2550 0000"),
                        "operating_hours": tags.get("opening_hours", "08:00-20:00"),
                        "capacity_meals": 250,
                        "has_cold_storage": False,
                        "accepted_food_types": ["cooked_meals", "raw_produce"],
                        "is_verified": False, # Explicit requirement: Overpass imports start unverified
                        "source": "osm_overpass",
                        "priority_level": 1
                    })
                if results:
                    return results
    except Exception as e:
        logger.warning(f"Overpass API query failed or timed out: {e}. Using fallback receivers.")

    return FALLBACK_RECEIVERS
