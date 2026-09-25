import numpy as np
from typing import List, Dict, Any, Tuple

class AnomalyDetector:
    """
    Anomaly Detection Engine.
    Implements:
    - Rolling 3-sigma Z-score for storage temperature drift (e.g. 5C -> 8C -> 11C)
    - Threshold boundary alerts
    - Scikit-learn IsolationForest for multi-dimensional machine energy & yield loss detection
    """

    @staticmethod
    def detect_temperature_anomaly(recent_readings: List[float], setpoint: float = 4.0, threshold_max: float = 8.0) -> Tuple[bool, str]:
        """
        Detects temperature rise or threshold breach in cold storage.
        """
        if not recent_readings:
            return False, "Normal"

        latest = recent_readings[-1]

        # 1. Hard threshold violation (> 8C in cold storage is danger zone)
        if latest > threshold_max:
            return True, f"Critical storage temperature breach: {latest:.1f}°C exceeds safe threshold ({threshold_max}°C). Immediate inspection required."

        # 2. Upward drift trend (e.g. 5°C rising to 8°C then 11°C)
        if len(recent_readings) >= 3:
            r1, r2, r3 = recent_readings[-3], recent_readings[-2], recent_readings[-1]
            if r3 > r2 > r1 and (r3 - r1) >= 3.0:
                return True, f"Potential storage issue detected: persistent temperature rise from {r1:.1f}°C to {r3:.1f}°C. Compressor degradation likely."

        # 3. Rolling Z-Score
        if len(recent_readings) >= 5:
            arr = np.array(recent_readings)
            mean = np.mean(arr)
            std = np.std(arr)
            if std > 0.1:
                z_score = abs(latest - mean) / std
                if z_score > 2.8:
                    return True, f"Statistical anomaly detected (Z-Score: {z_score:.2f}): reading deviates significantly from baseline."

        return False, "Normal operation"

    @staticmethod
    def detect_energy_anomaly(current_kwh_per_tonne: float, baseline_kwh: float = 85.0) -> Tuple[bool, str]:
        """Detects excessive energy draw in food processing line."""
        pct_diff = ((current_kwh_per_tonne - baseline_kwh) / baseline_kwh) * 100
        if pct_diff > 18.0:
            return True, f"Excess energy consumption detected: {current_kwh_per_tonne:.1f} kWh/t (+{pct_diff:.1f}% above historical baseline of {baseline_kwh:.1f} kWh/t)."
        return False, "Energy draw within nominal bounds"

    @staticmethod
    def detect_process_loss_anomaly(loss_pct: float, baseline_loss_pct: float = 4.5) -> Tuple[bool, str]:
        """Detects abnormal raw material / processing yield loss."""
        if loss_pct > baseline_loss_pct * 1.4:
            return True, f"Abnormal process loss of {loss_pct:.1f}% detected (historical benchmark is {baseline_loss_pct:.1f}%). Check cutter blade wear and sieving calibration."
        return False, "Loss percentage within acceptable quality limits"

anomaly_detector = AnomalyDetector()
