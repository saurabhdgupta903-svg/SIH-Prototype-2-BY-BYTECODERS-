from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .scripts.seed_12mo_data import seed_database
from .routers import (
    auth,
    forecast,
    waste,
    surplus,
    logistics,
    tracking_ws,
    processing,
    procurement,
    esg_reports,
    alerts,
    external_apis
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    import logging
    logger = logging.getLogger(__name__)
    try:
        # Initialize database tables and seed if empty
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await seed_database()
    except Exception as e:
        logger.error(f"Lifespan database startup notice/error: {e}")
    yield
    await engine.dispose()

app = FastAPI(
    title="FoodLoop API",
    description="Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units (MoFPI / SIH 2026 - SIH26234)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(forecast.router)
app.include_router(waste.router)
app.include_router(surplus.router)
app.include_router(logistics.router)
app.include_router(tracking_ws.router)
app.include_router(processing.router)
app.include_router(procurement.router)
app.include_router(esg_reports.router)
app.include_router(alerts.router)
app.include_router(external_apis.router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "FoodLoop Core API & ML Engine",
        "ministry": "Ministry of Food Processing Industries (MoFPI)",
        "problem_statement": "SIH26234"
    }
