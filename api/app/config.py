import os
from typing import List

class Settings:
    ENV: str = os.getenv("ENV", "development").lower()
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./foodloop.db")
    
    # In production, require an explicit, secure SECRET_KEY
    _raw_secret: str = os.getenv("SECRET_KEY", "")
    _insecure_default: str = "foodloop-mofpi-secret-key-production-grade-2026"
    if ENV == "production" and (not _raw_secret or _raw_secret == _insecure_default):
        raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY must be set to a secure, random value when ENV=production.")
    SECRET_KEY: str = _raw_secret or _insecure_default

    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS Allowed Origins
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    @property
    def cors_origins_list(self) -> List[str]:
        raw = self.CORS_ORIGINS.strip()
        if not raw:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        if raw.startswith("["):
            import json
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(o).rstrip("/") for o in parsed]
            except Exception:
                pass
        return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]

    OPEN_METEO_BASE_URL: str = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1")
    OPEN_METEO_AIR_QUALITY_URL: str = os.getenv("OPEN_METEO_AIR_QUALITY_URL", "https://air-quality-api.open-meteo.com/v1")
    OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
    NOMINATIM_BASE_URL: str = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
    OVERPASS_API_URL: str = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")

    CALENDARIFIC_API_KEY: str = os.getenv("CALENDARIFIC_API_KEY", "")
    ELECTRICITY_MAPS_API_KEY: str = os.getenv("ELECTRICITY_MAPS_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    INDIA_GRID_EMISSION_FACTOR: float = float(os.getenv("INDIA_GRID_EMISSION_FACTOR", "0.716")) # kg CO2e / kWh (CEA Baseline v19)
    FOOD_WASTE_EMISSION_FACTOR: float = float(os.getenv("FOOD_WASTE_EMISSION_FACTOR", "2.5"))   # kg CO2e / kg food (WRAP / IPCC)
    FOOD_WASTE_WATER_FACTOR: float = float(os.getenv("FOOD_WASTE_WATER_FACTOR", "1000.0"))     # Litres / kg food (FAO)

    DEMO_INSTITUTION_LAT: float = float(os.getenv("DEMO_INSTITUTION_LAT", "18.5204"))
    DEMO_INSTITUTION_LNG: float = float(os.getenv("DEMO_INSTITUTION_LNG", "73.8567"))
    DEMO_INSTITUTION_CITY: str = os.getenv("DEMO_INSTITUTION_CITY", "Pune")
    DEMO_INSTITUTION_STATE: str = os.getenv("DEMO_INSTITUTION_STATE", "Maharashtra")

settings = Settings()
