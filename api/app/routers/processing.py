from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from ..database import get_db
from ..models.processing import Machine, MachineStatus, MachineEvent, SensorReading
from ..models.institutions import ProcessingUnit
from ..schemas.processing import ProcessingUnitDashboard, MachineStatusSummary, StorageSensorData
from ..ml.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/api/processing", tags=["Food Processing Unit & Sensors"])

@router.get("/dashboard", response_model=ProcessingUnitDashboard)
async def get_processing_dashboard(unit_id: int = 1, db: AsyncSession = Depends(get_db)):
    pu = (await db.execute(select(ProcessingUnit).where(ProcessingUnit.id == unit_id))).scalars().first()
    machines = (await db.execute(select(Machine).where(Machine.processing_unit_id == unit_id))).scalars().all()
    sensors = (await db.execute(select(SensorReading).where(SensorReading.processing_unit_id == unit_id).order_by(SensorReading.recorded_at.desc()).limit(15))).scalars().all()

    # Calculations for raw material intake and yield
    raw_material_received = 4250.0 # kg today
    processed_kg = 3980.0          # kg
    process_loss_kg = round(raw_material_received - processed_kg, 1) # 270 kg
    process_loss_pct = round((process_loss_kg / raw_material_received) * 100, 2) # 6.35%
    baseline_loss = pu.baseline_loss_percentage if pu else 4.2

    loss_anomaly, loss_notes = anomaly_detector.detect_process_loss_anomaly(process_loss_pct, baseline_loss)

    # Energy calculations
    energy_kwh_per_tonne = 98.4
    baseline_energy = pu.baseline_energy_kwh_per_tonne if pu else 82.5
    energy_anomaly, energy_notes = anomaly_detector.detect_energy_anomaly(energy_kwh_per_tonne, baseline_energy)

    machine_summaries = []
    for m in machines:
        is_m_anomaly = m.status == MachineStatus.REDUCED_EFFICIENCY or m.current_efficiency_pct < 85.0
        machine_summaries.append(MachineStatusSummary(
            id=m.id,
            name=m.name,
            machine_type=m.machine_type,
            status=m.status.value,
            current_efficiency_pct=m.current_efficiency_pct,
            rated_power_kw=m.rated_power_kw,
            current_power_draw_kw=m.current_power_draw_kw,
            operating_hours_today=m.operating_hours_today,
            is_anomaly=is_m_anomaly,
            anomaly_detail="Compressor thermal load elevated; cycling duty cycle 82%" if is_m_anomaly else None
        ))

    sensor_summaries = [
        StorageSensorData(
            id=s.id,
            location=s.location,
            sensor_type=s.sensor_type,
            reading_value=s.reading_value,
            unit=s.unit,
            is_anomaly=s.is_anomaly,
            anomaly_reason=s.anomaly_reason,
            recorded_at=s.recorded_at
        ) for s in sensors
    ]

    return ProcessingUnitDashboard(
        unit_id=unit_id,
        unit_name=pu.name if pu else "Agro & Grain Pre-Processing Unit",
        raw_material_received_today_kg=raw_material_received,
        processed_today_kg=processed_kg,
        yield_efficiency_pct=round((processed_kg / raw_material_received) * 100, 1),
        process_loss_kg=process_loss_kg,
        process_loss_pct=process_loss_pct,
        historical_baseline_loss_pct=baseline_loss,
        loss_anomaly_detected=loss_anomaly,
        loss_anomaly_notes=loss_notes,
        energy_kwh_per_tonne=energy_kwh_per_tonne,
        baseline_energy_kwh_per_tonne=baseline_energy,
        excess_energy_detected=energy_anomaly,
        excess_energy_notes=energy_notes,
        machines=machine_summaries,
        recent_sensors=sensor_summaries,
        is_simulated=True
    )
