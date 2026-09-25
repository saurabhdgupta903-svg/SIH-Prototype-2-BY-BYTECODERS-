from typing import Dict, Any, Tuple
from datetime import datetime, time

class SurplusPredictor:
    """
    Surplus Prediction Engine (Separate from Demand Forecasting).
    Computes surplus ranges, risk levels, and automated pre-alerts.
    """

    @staticmethod
    def calculate_surplus_range(
        planned_portions: int,
        predicted_demand: int,
        interval_lower: int,
        interval_upper: int,
        meal_type: str
    ) -> Dict[str, Any]:
        """
        Calculates exact expected surplus bounds and pre-alert time window.
        """
        # Surplus = Planned - Actual demand
        # Min surplus occurs when demand is high (upper bound)
        # Max surplus occurs when demand is low (lower bound)
        surplus_min = max(0, planned_portions - interval_upper)
        surplus_max = max(0, planned_portions - interval_lower)
        surplus_expected = max(0, planned_portions - predicted_demand)

        # Service windows
        meal_windows = {
            "breakfast": ("09:00", "10:30 AM"),
            "lunch": ("02:00", "03:30 PM"),
            "dinner": ("08:00", "09:30 PM")
        }
        start_w, end_w = meal_windows.get(meal_type.lower(), ("08:00", "09:30 PM"))

        if surplus_max > 30:
            risk = "High"
            alert_text = f"Potential surplus of {surplus_min} to {surplus_max} meals expected between {start_w} and {end_w}. Standby alerts sent to nearby verified receivers."
        elif surplus_max > 10:
            risk = "Medium"
            alert_text = f"Moderate surplus of {surplus_min} to {surplus_max} meals expected between {start_w} and {end_w}."
        else:
            risk = "Low"
            alert_text = f"Nominal surplus expected (under 10 meals). Local internal buffer sufficient."

        return {
            "surplus_min_portions": surplus_min,
            "surplus_max_portions": surplus_max,
            "surplus_expected_portions": surplus_expected,
            "risk_level": risk,
            "time_window": f"{start_w} - {end_w}",
            "pre_alert_message": alert_text
        }

    @staticmethod
    def recommend_recovery_path(
        food_category: str,
        holding_hours: float,
        storage_temp_c: float,
        vision_risk_category: str
    ) -> str:
        """
        Multi-path recovery hierarchy:
        1. Edible donation (food bank, shelter, community kitchen)
        2. Secondary buyer (discounted commercial / pantry redistribution)
        3. Animal feed (where local norms permit)
        4. Organic recycling (compost / biogas)
        """
        # If unsafe for human consumption
        if vision_risk_category == "Do not redistribute" or holding_hours > 8.0 or (storage_temp_c > 15 and storage_temp_c < 55 and holding_hours > 3.0):
            if "raw" in food_category.lower() or "vegetable" in food_category.lower() or "grain" in food_category.lower():
                return "animal_feed"
            return "organic_recycling"

        if vision_risk_category == "Verification required":
            return "edible_donation" # Subject to supervisor pin signoff

        # Fresh surplus
        if holding_hours <= 4.0:
            return "edible_donation"
        elif holding_hours <= 6.0:
            return "secondary_buyer"
        else:
            return "animal_feed"

surplus_predictor = SurplusPredictor()
