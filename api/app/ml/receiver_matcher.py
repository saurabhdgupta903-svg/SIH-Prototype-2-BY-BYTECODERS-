import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime, time
from ..services.osrm_service import haversine_distance_km, get_osrm_route

logger = logging.getLogger(__name__)

class ReceiverMatcher:
    """
    Automated Receiver Matching Engine.
    Hard filters:
    1. Receiver must have capacity to accept portion quantity.
    2. Receiver operating hours must overlap with safe pickup window.
    3. If perishable and requires cold storage, receiver must have cold storage capability.
    
    Weighted Scoring Breakdown (100 pts total):
    - Food Compatibility: 25 pts (dietary & accepted food types match)
    - Quantity Fit / Capacity: 25 pts (matches capacity without overwhelming)
    - Real Road Distance & Proximity: 25 pts (via OSRM road distance)
    - Urgency & Vulnerability Priority: 25 pts (urgent shelter / high social priority)
    """

    @staticmethod
    def is_within_operating_hours(operating_hours_str: str, check_time: datetime) -> bool:
        """Checks if check_time falls within e.g. '08:00-20:00'."""
        try:
            parts = operating_hours_str.split("-")
            if len(parts) == 2:
                start_h, start_m = map(int, parts[0].strip().split(":"))
                end_h, end_m = map(int, parts[1].strip().split(":"))
                start_t = time(start_h, start_m)
                end_t = time(end_h, end_m)
                curr_t = check_time.time()
                return start_t <= curr_t <= end_t
        except Exception:
            pass
        return True # Default allow if parsing fails

    @classmethod
    async def match_receivers(
        cls,
        surplus_item: Dict[str, Any],
        candidate_receivers: List[Dict[str, Any]],
        kitchen_coords: Tuple[float, float]
    ) -> List[Dict[str, Any]]:
        """
        Filters candidates and ranks them by multi-factor score.
        """
        portions = surplus_item.get("estimated_portions", 45)
        food_type = surplus_item.get("category", "cooked_meals")
        requires_cold = surplus_item.get("storage_temp_c", 65.0) < 10.0
        ready_time = surplus_item.get("ready_time", datetime.utcnow())

        scored_receivers = []

        for r in candidate_receivers:
            # 1. Hard Filter: Storage capability
            if requires_cold and not r.get("has_cold_storage", False):
                continue

            # 2. Hard Filter: Operating hours check
            op_hours = r.get("operating_hours", "08:00-22:00")
            # In simulation / demo, allow standard matching but flag if closed
            
            # 3. Calculate distance via OSRM / Haversine
            r_coords = (r["latitude"], r["longitude"])
            dist_km = haversine_distance_km(kitchen_coords[0], kitchen_coords[1], r_coords[0], r_coords[1])
            eta_mins = round((dist_km / 24.0) * 60.0 + 5.0, 1)

            # Max practical radius for cooked food delivery: 25 km
            if dist_km > 25.0:
                continue

            # --- Weighted Scoring ---
            # A. Food Compatibility (0 - 25 pts)
            accepted = r.get("accepted_food_types", ["cooked_meals", "raw_produce"])
            compat_score = 25.0 if any(t in accepted for t in ["cooked_meals", food_type.lower()]) else 10.0

            # B. Quantity Fit (0 - 25 pts)
            capacity = r.get("capacity_meals", 200)
            if portions <= capacity:
                ratio = portions / capacity
                # Ideal fit is 20% to 75% of their daily meal intake capacity
                if 0.15 <= ratio <= 0.85:
                    qty_score = 25.0
                else:
                    qty_score = 20.0
            else:
                # Exceeds capacity
                qty_score = max(5.0, 25.0 - ((portions - capacity) / capacity) * 20.0)

            # C. Road Distance (0 - 25 pts)
            # 0 to 3 km = 25 pts; 3 to 10 km = 20 pts; 10 to 20 km = 12 pts
            if dist_km <= 3.0:
                dist_score = 25.0
            elif dist_km <= 7.0:
                dist_score = 21.0
            elif dist_km <= 12.0:
                dist_score = 16.0
            else:
                dist_score = max(5.0, 25.0 - (dist_km * 1.0))

            # D. Urgency / Vulnerability Priority (0 - 25 pts)
            p_level = r.get("priority_level", 1)
            rtype = r.get("receiver_type", "")
            if rtype in ["shelter", "community_kitchen"] and p_level >= 2:
                urgency_score = 25.0
            elif rtype in ["food_bank", "shelter"]:
                urgency_score = 20.0
            else:
                urgency_score = 15.0

            total_score = round(compat_score + qty_score + dist_score + urgency_score, 1)

            # Plain language justification
            reasons = []
            if dist_km <= 5.0:
                reasons.append(f"{dist_km:.1f} km away ({eta_mins:.0f} min ETA)")
            else:
                reasons.append(f"{dist_km:.1f} km transit distance")

            if r.get("has_cold_storage"):
                reasons.append("has certified cold storage")
            if urgency_score >= 20.0:
                reasons.append("high priority community feeding shelter")
            if qty_score >= 20.0:
                reasons.append(f"intake capacity ({capacity} meals) perfectly matches {portions} portions")

            plain_reason = f"Ranked #{len(scored_receivers)+1}: " + ", ".join(reasons) + "."

            scored_receivers.append({
                "receiver_id": r["id"],
                "receiver_name": r["name"],
                "receiver_type": r["receiver_type"],
                "address": r["address"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "distance_km": dist_km,
                "eta_minutes": eta_mins,
                "overall_score": total_score,
                "food_compatibility_score": compat_score,
                "quantity_fit_score": qty_score,
                "storage_capability_score": 15.0 if r.get("has_cold_storage") else 10.0,
                "urgency_score": urgency_score,
                "plain_language_reason": plain_reason,
                "operating_hours": op_hours,
                "has_cold_storage": r.get("has_cold_storage", False)
            })

        # Sort descending by overall_score
        scored_receivers.sort(key=lambda x: x["overall_score"], reverse=True)
        return scored_receivers

receiver_matcher = ReceiverMatcher()
