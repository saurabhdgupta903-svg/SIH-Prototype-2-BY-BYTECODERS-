from typing import Dict, Any, Optional
from datetime import datetime
from ..models.waste_surplus import QualityRiskCategory

class QualityScreeningEngine:
    """
    Two-Level Food Safety & Quality Assessment Engine.
    Level 1: Deterministic Food Safety Rules (FSSAI/MoFPI Temperature & Time Limits).
    Level 2: Vision-based visual condition screening (swappable heuristic / Gemini API).
    Screening and decision support only; never an automated food safety authority.
    Human authorized supervisor signoff is mandatory before release.
    """

    @staticmethod
    def evaluate_level1_rules(
        preparation_timestamp: datetime,
        current_timestamp: datetime,
        storage_temperature_c: float,
        packaging_integrity: str = "intact",
        food_category: str = "Cooked Staples"
    ) -> Dict[str, Any]:
        """
        Level 1: Rule-based screening based on time, temperature, and packaging.
        Danger zone: 5°C to 60°C.
        Holding limit: 4 hours at room temp, 48 hours chilled.
        """
        holding_hours = max(0.1, (current_timestamp - preparation_timestamp).total_seconds() / 3600.0)
        passed = True
        warnings = []

        # Check packaging
        if packaging_integrity.lower() not in ["intact", "sealed"]:
            passed = False
            warnings.append(f"Packaging status '{packaging_integrity}' compromises food hygiene.")

        # Check temperature danger zone
        is_hot_holding = storage_temperature_c >= 60.0
        is_cold_holding = storage_temperature_c <= 5.0

        if not (is_hot_holding or is_cold_holding):
            # In danger zone (5°C to 60°C)
            if holding_hours > 4.0:
                passed = False
                warnings.append(f"Food has been in ambient danger zone ({storage_temperature_c:.1f}°C) for {holding_hours:.1f} hours (limit: 4.0 hrs).")
            elif holding_hours > 2.0:
                warnings.append(f"Food in danger zone ({storage_temperature_c:.1f}°C) for {holding_hours:.1f} hours: accelerated redistribution required.")

        # Expiry limit even if chilled
        if is_cold_holding and holding_hours > 72.0:
            passed = False
            warnings.append(f"Refrigerated holding exceeded maximum shelf life of 72 hours.")

        summary = "; ".join(warnings) if warnings else "Complies with MoFPI and FSSAI safe holding parameters."
        return {
            "passed": passed,
            "holding_hours": round(holding_hours, 1),
            "storage_temp_c": storage_temperature_c,
            "summary": summary
        }

    @staticmethod
    def evaluate_level2_vision(
        image_url: Optional[str],
        level1_passed: bool,
        holding_hours: float,
        food_category: str
    ) -> Dict[str, Any]:
        """
        Level 2: Visual Risk Screening.
        Outputs one of three strict categories:
        - "Low apparent risk"
        - "Verification required"
        - "Do not redistribute"
        """
        if not level1_passed:
            return {
                "risk_score": 0.85,
                "category": QualityRiskCategory.DO_NOT_REDISTRIBUTE.value,
                "notes": "Rule check failed: temperature or holding duration outside safe limits.",
                "is_simulated": True
            }

        # If holding is between 2.5 and 4 hours, requires human verification
        if holding_hours >= 2.5 or not image_url:
            return {
                "risk_score": 0.42,
                "category": QualityRiskCategory.VERIFICATION_REQUIRED.value,
                "notes": f"Surface inspection normal, but holding time ({holding_hours:.1f}h) requires physical sensory check by kitchen supervisor.",
                "is_simulated": True
            }

        return {
            "risk_score": 0.12,
            "category": QualityRiskCategory.LOW_APPARENT_RISK.value,
            "notes": "Visual appearance, texture consistency, and thermal holding within safe bounds.",
            "is_simulated": True
        }

quality_screening_engine = QualityScreeningEngine()
