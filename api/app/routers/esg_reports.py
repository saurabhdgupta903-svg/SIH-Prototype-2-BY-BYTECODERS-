from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List
from datetime import date
from ..database import get_db
from ..models.analytics import ImpactMetric, EmissionFactor
from ..models.institutions import Institution, Receiver
from ..schemas.esg import ESGReportData, CitationItem
from ..services.pdf_generator import generate_esg_pdf

router = APIRouter(prefix="/api/reports", tags=["Sustainability & ESG Compliance"])

@router.get("/esg-summary", response_model=ESGReportData)
async def get_esg_summary(institution_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Module S: Sustainability dashboard summary with source citations.
    """
    inst = (await db.execute(select(Institution).where(Institution.id == institution_id))).scalars().first()
    factors = (await db.execute(select(EmissionFactor))).scalars().all()

    # Monthly historical trend data for the 12-month period
    monthly_trend = [
        {"month": "Oct 2025", "waste_prevented_kg": 980, "food_rescued_kg": 780, "co2e_avoided_kg": 4400},
        {"month": "Nov 2025", "waste_prevented_kg": 1120, "food_rescued_kg": 850, "co2e_avoided_kg": 4925},
        {"month": "Dec 2025", "waste_prevented_kg": 1250, "food_rescued_kg": 940, "co2e_avoided_kg": 5475},
        {"month": "Jan 2026", "waste_prevented_kg": 1310, "food_rescued_kg": 1020, "co2e_avoided_kg": 5825},
        {"month": "Feb 2026", "waste_prevented_kg": 1190, "food_rescued_kg": 980, "co2e_avoided_kg": 5425},
        {"month": "Mar 2026", "waste_prevented_kg": 1420, "food_rescued_kg": 1150, "co2e_avoided_kg": 6425},
        {"month": "Apr 2026", "waste_prevented_kg": 1380, "food_rescued_kg": 1090, "co2e_avoided_kg": 6175},
        {"month": "May 2026", "waste_prevented_kg": 1290, "food_rescued_kg": 1040, "co2e_avoided_kg": 5825},
        {"month": "Jun 2026", "waste_prevented_kg": 1340, "food_rescued_kg": 1110, "co2e_avoided_kg": 6125},
        {"month": "Jul 2026", "waste_prevented_kg": 1450, "food_rescued_kg": 1220, "co2e_avoided_kg": 6675},
        {"month": "Aug 2026", "waste_prevented_kg": 1520, "food_rescued_kg": 1280, "co2e_avoided_kg": 7000},
        {"month": "Sep 2026", "waste_prevented_kg": 1425, "food_rescued_kg": 1184, "co2e_avoided_kg": 6522}
    ]

    citations = [
        CitationItem(
            factor_name=f.commodity_or_resource,
            value=f.emission_factor_kg_co2e,
            unit=f.unit,
            source=f.source_citation,
            notes=f.assumptions
        ) for f in factors
    ]

    return ESGReportData(
        institution_name=inst.name if inst else "Sahyadri Institutional Complex",
        reporting_period="Past 12 Months (October 2025 - September 2026)",
        waste_prevented_kg=14250.0,
        surplus_redistributed_kg=11840.0,
        meals_served_to_community=26310,
        co2e_emissions_avoided_kg=65225.0,
        water_conserved_litres=26090000.0,
        financial_value_reclaimed_inr=1695850.0,
        monthly_trend=monthly_trend,
        citations=citations,
        is_simulated=True
    )

@router.get("/download-pdf")
async def download_esg_pdf(institution_id: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Module T: Server-side PDF generation using ReportLab.
    Produces verifiable MoFPI ESG Compliance Certificate.
    """
    summary = await get_esg_summary(institution_id, db)
    pdf_bytes = generate_esg_pdf(summary.model_dump())

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="FoodLoop_ESG_Compliance_Certificate.pdf"'
        }
    )

@router.get("/admin-regional")
async def get_regional_admin_data(db: AsyncSession = Depends(get_db)):
    """
    Module U: Regional admin & reviewer overview covering Maharashtra corridor:
    Mumbai, Pune, Nashik, Nagpur with clustered counts, drilldowns, and rising waste flags.
    """
    regions = [
        {
            "region_name": "Pune Metropolitan Region",
            "center": [18.5204, 73.8567],
            "institutions_count": 14,
            "active_kitchens": 18,
            "receivers_count": 28,
            "tonnes_rescued": 11.84,
            "waste_prevented_tonnes": 14.25,
            "co2e_avoided_tonnes": 65.2,
            "status": "Optimal",
            "trend": "downward_waste"
        },
        {
            "region_name": "Mumbai Suburban & MMR",
            "center": [19.0760, 72.8777],
            "institutions_count": 22,
            "active_kitchens": 31,
            "receivers_count": 45,
            "tonnes_rescued": 24.10,
            "waste_prevented_tonnes": 29.50,
            "co2e_avoided_tonnes": 134.0,
            "status": "Attention Required",
            "trend": "rising_waste" # Flagged as institution with rising waste
        },
        {
            "region_name": "Nashik Agro Corridor",
            "center": [19.9975, 73.7898],
            "institutions_count": 9,
            "active_kitchens": 11,
            "receivers_count": 16,
            "tonnes_rescued": 7.40,
            "waste_prevented_tonnes": 8.90,
            "co2e_avoided_tonnes": 40.7,
            "status": "Optimal",
            "trend": "downward_waste"
        },
        {
            "region_name": "Nagpur Vidarbha Region",
            "center": [21.1458, 79.0882],
            "institutions_count": 11,
            "active_kitchens": 14,
            "receivers_count": 19,
            "tonnes_rescued": 9.15,
            "waste_prevented_tonnes": 10.80,
            "co2e_avoided_tonnes": 49.8,
            "status": "Optimal",
            "trend": "downward_waste"
        }
    ]

    institutions_table = [
        {"name": "Sahyadri Educational Complex", "city": "Pune", "type": "College", "waste_this_week_kg": 84.5, "change_pct": -21.9, "status": "Improving"},
        {"name": "Vidyavihar Campus Hostels", "city": "Mumbai", "type": "Hostel", "waste_this_week_kg": 164.2, "change_pct": +18.4, "status": "Rising Waste Flag"},
        {"name": "Godavari Food Processing Unit", "city": "Nashik", "type": "Processing Unit", "waste_this_week_kg": 42.0, "change_pct": -8.1, "status": "Improving"},
        {"name": "Deekshabhoomi Healthcare Canteen", "city": "Nagpur", "type": "Hospital", "waste_this_week_kg": 72.8, "change_pct": -4.2, "status": "Stable"}
    ]

    return {
        "total_institutions": 56,
        "total_active_kitchens": 74,
        "total_receivers": 108,
        "total_tonnes_rescued": 52.49,
        "total_waste_prevented_tonnes": 63.45,
        "total_co2e_avoided_tonnes": 289.7,
        "regions": regions,
        "institutions": institutions_table,
        "is_simulated": True
    }
