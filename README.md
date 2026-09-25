# FoodLoop (MoFPI / SIH 2026 - SIH26234)
**Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units**

Ministry: **Ministry of Food Processing Industries (MoFPI)**  
Theme: **Agriculture, FoodTech and Rural Development**  
Core Principle: **Prevention First** (One complete working workflow from forecast to ESG audit)

---

## 1. System Architecture

FoodLoop consists of three integrated services:
1. **Web (Frontend)**: Next.js 14 App Router, TypeScript, Tailwind CSS, Leaflet with OpenStreetMap tiles, `react-i18next` (English, Hindi, Marathi), PWA Service Worker with native IndexedDB offline queue.
2. **API (Backend & ML)**: FastAPI (Python), SQLAlchemy 2.0 (PostgreSQL + PostGIS in Docker, SQLite spatial fallback in standalone development), Scikit-Learn (Random Forest, Gradient Boosting, Linear Regression baseline, IsolationForest), Google OR-Tools (Vehicle Routing Problem), ReportLab (Server-side ESG PDF generator), WebSockets for live driver GPS and cold storage telemetry.
3. **DB (Database)**: PostgreSQL 16 with PostGIS extensions.

---

## 2. Quick Start & Setup

### Option A: One-Command Docker Compose (Production Setup)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- API & Docs: `http://localhost:8000/docs`
- PostGIS Database: `localhost:5432`

### Option B: Local Standalone Development

#### Backend (FastAPI):
```bash
cd api
python -m pip install -r requirements.txt
python -m app.scripts.seed_12mo_data
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### Frontend (Next.js):
```bash
cd web
npm install
npm run build
npm start
```
Open `http://localhost:3000` in any modern web browser.

---

## 3. Environment Variables (`.env`)

See `.env.example` in the project root:
- `DATABASE_URL`: Connection string (`postgresql+asyncpg://...` or `sqlite+aiosqlite:///./foodloop.db`).
- `SECRET_KEY`: Cryptographic signing key for JWT tokens and supervisor PIN hashing.
- `OPEN_METEO_BASE_URL`: Open-Meteo weather endpoint (public, no key required).
- `OSRM_BASE_URL`: OSRM routing engine (default `https://router.project-osrm.org`).
- `NOMINATIM_BASE_URL`: OpenStreetMap Nominatim geocoding endpoint (rate limited at 1 req/s).
- `OVERPASS_API_URL`: OpenStreetMap Overpass query endpoint for community receivers.
- `INDIA_GRID_EMISSION_FACTOR`: `0.716` kg CO2e / kWh (Central Electricity Authority Baseline v19).
- `FOOD_WASTE_EMISSION_FACTOR`: `2.50` kg CO2e / kg food (IPCC AR6 / WRAP UK).

---

## 4. Real-Time External APIs & Caching

| External API | Purpose | Rate Limit & Fallback Strategy |
|---|---|---|
| **Open-Meteo Forecast** | Real-time temperature and precipitation feeding demand models | In-memory 30-min cache; seasonal climate normal fallback |
| **Open-Meteo Air Quality** | Context panel for institutional kitchens | In-memory cache; regional baseline constant fallback |
| **OSM Nominatim** | Facility address geocoding to latitude/longitude | 1.05s lock delay, custom User-Agent, in-memory cache |
| **OSM Overpass API** | Discovers nearby food banks, shelters, and community kitchens | Imports unverified; fallback table with 6 Pune receivers |
| **OSRM Route & Table** | Road distance, duration, and GeoJSON route polyline | 1.28x Haversine road curvature matrix fallback |
| **Browser Geolocation** | `navigator.geolocation.watchPosition` driver GPS streaming | Built-in "Simulate Driver" mode tracing OSRM polyline |

---

## 5. Statistical Rigor & Model Metrics

Trained on 12 months (1,095 meal instances) of synthetic campus consumption patterns:
- **Baseline Model (OLS / 7-Day Mean)**: MAE = `28.4` portions | MAPE = `3.65%`
- **Production Model (RandomForestRegressor)**: MAE = `12.8` portions | MAPE = `1.62%`
- **Error Reduction**: **54.9% error variance reduction** over naive historical baseline.
- **Prediction Interval**: 90% confidence interval based on residual standard deviation.

---

## 6. Complete 5-Minute Demonstration Walkthrough

1. **Kitchen Dashboard (`/kitchen/dashboard`)**:
   - Inspect Expected Demand (`820 portions`) vs Recommended Prep (`790 portions`).
2. **Surplus Pre-Alert (`/kitchen/dashboard`)**:
   - Click `"Demo Step 2: Simulate 45 Meals Surplus"` -> Pre-alert created for 45 meals between 8:00 and 9:30 PM.
3. **Food Safety Assessment (`/kitchen/quality`)**:
   - Level 1 rule engine confirms hot holding (>60°C).
   - Level 2 vision risk screen indicates `Verification required`.
   - Supervisor enters PIN `1234` to sign off release (logged to audit trail).
4. **Automated Matching (`/kitchen/surplus`)**:
   - Multi-factor algorithm scores 6 candidate receivers.
   - Top match (Annapoorna Community Kitchen) selected (Score: 100/100).
5. **Route Optimization (`/driver/route`)**:
   - Real OSRM road polyline generated (1.31 km, 3.2 min ETA).
6. **Live Driver Tracking & Confirmation (`/driver/route`)**:
   - Click `"Simulate Driver Movement"` -> Moving marker follows road polyline over WebSocket.
   - Click `"Receiver Confirms 45 Meals Received"` -> Handover confirmed.
7. **Sustainability & ESG PDF (`/kitchen/reports`)**:
   - Real-time ledger updates (+45 meals, +18.9 kg diverted, +47.3 kg CO2e avoided).
   - Click `"Download Official MoFPI ESG PDF"` to generate server-side ReportLab compliance certificate.
8. **With vs Without Forecasting Panel**:
   - Data-derived comparative impact panel (Planned 900 vs Actual 820 -> 35 prevented, 45 redistributed, 80 total waste avoided).

---

## 7. Data Honesty & Simulated Data Disclosure

No institutional consumption dataset is supplied with the problem statement. The following components use realistic simulated data and are labelled with `"Simulated data"`:
1. **12-Month Historical Campus Consumption**: Generated with weekday effects, Indian holiday dips, exam peaks, and monsoon variations.
2. **Processing Unit IoT Telemetry**: Sensor readings for cold storage temperature drift (5°C -> 8°C -> 11°C) and machine power draw.
3. **Machine Monitoring Status**: Historical runtime and failure logs.
4. **Visual Risk Classification**: Rule-assisted heuristic screening.

---

## 8. Automated Test Suite

Run all unit tests via pytest:
```bash
pytest api/tests/
```
Tests cover:
- `test_forecast.py`: Demand forecasting logic, weather discounting, weekend effects.
- `test_matching.py`: Multi-factor receiver scoring and hard filter exclusions.
- `test_routing.py`: Google OR-Tools VRP and OSRM road distance fallback.
- `test_offline_sync.py`: Operator note text classification into MoFPI waste reasons.
- `test_rbac.py`: JWT generation, decoding, and role permission enforcement.

---

## 9. Pitch Notes: How FoodLoop Differs from Traditional Food Donation Apps

1. **Prevention Before Production**: Traditional donation apps only collect food *after* it becomes waste. FoodLoop forecasts meal demand before cooking starts, reducing source waste at the procurement stage.
2. **Procurement Link**: Integrates pantry inventory with demand forecasts, preventing excessive purchasing of perishable staples.
3. **Food Processing Unit (FPU) Monitoring**: Incorporates industrial agro-processing facilities, monitoring machine downtime, specific energy consumption (kWh/t), and process loss anomalies.
4. **Multi-Path Recovery Hierarchy**: Routes surplus intelligently across human edible consumption, secondary commercial markets, animal feed, and organic composting.
5. **Offline Field Workflow**: Kitchen operators log waste without connectivity via IndexedDB; entries synchronize automatically upon reconnect.
6. **Government Oversight & Audit**: Clustered regional maps, DPDP Act 2023 compliance, tamper-proof audit trails, and server-side ESG certificates citing published CEA, IPCC, WRAP, and FAO factors.

### Honest Limitations:
- Real-world institutional deployment requires biometric or turnstile integration for headcount tracking.
- Vision-based food safety screening cannot detect microscopic microbial toxins; physical sensory supervisor inspection remains indispensable.
- In low-connectivity rural zones without mobile data, live GPS tracking relies on periodic SMS updates or offline waypoint caching.
