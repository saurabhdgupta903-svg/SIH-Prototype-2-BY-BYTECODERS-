import pytest
from datetime import date
from app.ml.demand_forecaster import demand_forecaster

def test_demand_forecasting_logic():
    # Test weekday lunch demand for 850 headcount
    target = date(2026, 10, 14) # Wednesday
    result = demand_forecaster.predict_demand(
        meal_type="lunch",
        headcount=850,
        target_date=target,
        temperature_c=28.0,
        precipitation_mm=0.0,
        planned_portions=850
    )
    assert result["predicted_demand_portions"] > 700
    assert result["prediction_interval_lower"] < result["predicted_demand_portions"]
    assert result["prediction_interval_upper"] > result["predicted_demand_portions"]
    assert result["recommended_production_portions"] >= result["predicted_demand_portions"]
    assert result["surplus_risk_level"] in ["Low", "Medium", "High"]

def test_weather_and_weekend_discounting():
    # Weekend should reduce demand compared to weekday
    weekday = date(2026, 10, 14) # Wednesday
    weekend = date(2026, 10, 18) # Sunday
    res_wd = demand_forecaster.predict_demand("lunch", 850, weekday)
    res_we = demand_forecaster.predict_demand("lunch", 850, weekend)
    assert res_we["predicted_demand_portions"] < res_wd["predicted_demand_portions"]
