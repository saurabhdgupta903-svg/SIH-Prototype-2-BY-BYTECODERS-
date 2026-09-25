# FoodLoop - Production Deployment & Operations Guide
**Smart Food Waste Reduction and Sustainable Redistribution Ecosystem (MoFPI / SIH26234)**

---

## 1. Live Links

| Service | Target URL | Status |
|---|---|---|
| **Frontend Web (Vercel)** | [https://sih-prototype-2-by-bytecoders-2.vercel.app/](https://sih-prototype-2-by-bytecoders-2.vercel.app/) | Verified LIVE (HTTP 200) |
| **API Core (Render)** | [https://foodloop-api-gszb.onrender.com](https://foodloop-api-gszb.onrender.com) | Provisioning / Deploying |
| **API Health Check** | [https://foodloop-api-gszb.onrender.com/health](https://foodloop-api-gszb.onrender.com/health) | Target Health Endpoint |
| **Interactive Docs (Swagger)** | [https://foodloop-api-gszb.onrender.com/docs](https://foodloop-api-gszb.onrender.com/docs) | Target Docs Endpoint |
| **Live Telemetry & Tracking (WSS)** | `wss://foodloop-api-gszb.onrender.com/ws/driver-tracking` | Target WebSocket Endpoint |

---

## 2. Seed Demo Accounts

The database seeds with 6 distinct roles on initialization:

| Persona / Role | Email | Password | Access Scope |
|---|---|---|---|
| **Kitchen Manager** | `kitchen@foodloop.gov.in` | `kitchen123` | Institutional Kitchen Dashboard, Daily Plan, Demand Forecasting, Surplus Redistribution, Quality Clearance, ESG Reports |
| **Food Processing Lead** | `fpu@foodloop.gov.in` | `fpu123` | Processing Efficiency, By-Product Valorization, Machine IoT Telemetry, Cold Storage Anomaly Stream |
| **Receiver (Community Kitchen)** | `receiver@foodloop.gov.in` | `receiver123` | Surplus Acceptance Registry, Delivery Handover PIN Confirmation |
| **Logistics Driver** | `driver@foodloop.gov.in` | `driver123` | Live GPS Route Optimization (OR-Tools CVRP), Turn-by-Turn polyline, WebSocket telemetry |
| **Administrator (MoFPI Director)** | `admin@foodloop.gov.in` | `admin123` | National Clustered GIS Map, Organization Verification, ML Model Performance, Critical Alerts |
| **Government Reviewer** | `reviewer@foodloop.gov.in` | `reviewer123` | Read-only ESG Compliance, Audit Trail Verification, DPDP Act 2023 compliance logs |

---

## 3. Environment Variables Reference

### Backend (Render - Managed via `render.yaml` or Dashboard)

| Variable | Target Value / Format | Purpose |
|---|---|---|
| `ENV` | `production` | Enables production security checks (e.g. strict SECRET_KEY validation). |
| `DATABASE_URL` | Auto-populated by Render Blueprint | Managed connection string to `foodloop-db` (`postgresql+asyncpg://...`). |
| `SECRET_KEY` | Auto-generated 64-char random hex | Cryptographic signing of JWT tokens and PIN hashes. |
| `ALGORITHM` | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24-hour token validity. |
| `CORS_ORIGINS` | `https://<your-vercel-app>.vercel.app,http://localhost:3000` | Allowed web clients for cross-origin credentials. |
| `OPEN_METEO_BASE_URL` | `https://api.open-meteo.com/v1` | Weather forecast feeding meal demand ML models. |
| `OPEN_METEO_AIR_QUALITY_URL` | `https://air-quality-api.open-meteo.com/v1` | Environmental context indicators. |
| `OSRM_BASE_URL` | `https://router.project-osrm.org` | OpenStreetMap road distance matrix and routing polyline. |
| `NOMINATIM_BASE_URL` | `https://nominatim.openstreetmap.org` | Geocoding service with rate-limit lock (1 req/s). |
| `OVERPASS_API_URL` | `https://overpass-api.de/api/interpreter` | Overpass API for querying nearby community shelters. |
| `INDIA_GRID_EMISSION_FACTOR` | `0.716` | CEA CO2 Baseline Database v19 (kg CO2e / kWh). |
| `FOOD_WASTE_EMISSION_FACTOR` | `2.5` | IPCC AR6 / WRAP UK Benchmark (kg CO2e / kg food). |
| `FOOD_WASTE_WATER_FACTOR` | `1000.0` | FAO Aquastat footprint factor (Litres water / kg food). |
| `DEMO_INSTITUTION_LAT` | `18.5204` | Institution latitude (Pune corridor). |
| `DEMO_INSTITUTION_LNG` | `73.8567` | Institution longitude (Pune corridor). |
| `DEMO_INSTITUTION_CITY` | `Pune` | Institution municipality. |
| `DEMO_INSTITUTION_STATE` | `Maharashtra` | State jurisdiction. |
| `CALENDARIFIC_API_KEY` | *(Optional)* | Holiday calendar API key (has seasonal fallback). |
| `ELECTRICITY_MAPS_API_KEY` | *(Optional)* | Real-time marginal grid emissions key (has CEA fallback). |
| `GEMINI_API_KEY` | *(Optional)* | Vision AI screening key (has rule-engine fallback). |

### Frontend (Vercel Project Settings)

| Variable | Example Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://foodloop-api.onrender.com` | Base REST API URL without trailing slash. |
| `NEXT_PUBLIC_WS_URL` | `wss://foodloop-api.onrender.com` | WebSocket endpoint for live GPS and sensor feeds. |

---

## 4. Deployment Order & Step-by-Step Instructions

### Step 1: Push Code to GitHub
1. Initialize repository and commit cleaned files (verified by `.gitignore`).
2. Create a new GitHub repository (public or private) named `FoodLoop-SIH26234`.
3. Push to `main` branch.

### Step 2: Deploy Backend & Database on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Select your connected GitHub repository `FoodLoop-SIH26234`.
4. Render automatically reads `render.yaml` and provisions:
   - PostgreSQL Database: `foodloop-db` (Region: Singapore).
   - Web Service: `foodloop-api` (Python 3.11.9, auto-seeds 12 months data on startup).
5. Click **Apply**.
6. Wait 3-5 minutes for build and database creation.
7. Copy your assigned API URL: `https://<service-name>.onrender.com`.
8. Verify `https://<service-name>.onrender.com/health` returns `{"status":"healthy"}`.

### Step 3: Deploy Frontend on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `FoodLoop-SIH26234` GitHub repository.
4. In Project Settings:
   - **Root Directory**: `web`
   - **Framework Preset**: Next.js
   - **Node.js Version**: 20.x
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-api>.onrender.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://<your-render-api>.onrender.com`
6. Click **Deploy**.
7. Once build completes, copy your production Vercel URL: `https://<project-name>.vercel.app`.

### Step 4: Update CORS on Render
1. In Render Dashboard, open `foodloop-api` -> **Environment**.
2. Update `CORS_ORIGINS` to include your Vercel URL:
   `https://<project-name>.vercel.app,http://localhost:3000`
3. Click **Save Changes** (triggers quick reload).

---

## 5. Operations: Logs, Redeployments & Rollbacks

- **View API Logs**: In Render, open `foodloop-api` -> **Logs**. Filter by `error` or inspect lifespan startup seeding.
- **View Vercel Logs**: In Vercel, open project -> **Deployments** -> select latest deployment -> **Functions / Logs**.
- **Manual Redeploy**:
  - Render: Click **Manual Deploy** -> **Clear build cache & deploy**.
  - Vercel: Click **Redeploy** on any past deployment.
- **Rollback**:
  - In Vercel, go to **Deployments**, locate the desired stable deployment, click **...** -> **Promote to Production**.
  - In Render, go to **Deploys**, select previous commit, click **Rollback to this deploy**.

---

## 6. Demo-Day Reliability & Production Best Practices

> [!IMPORTANT]
> **Render Free Plan Sleeping (Cold Starts)**:
> - Render free web instances spin down after 15 minutes of inactivity.
> - A cold start takes approximately **50-70 seconds** to wake up.
> - **Demo Action**: Exactly **2 to 3 minutes prior to the live demonstration or judge review**, open `https://<your-render-api>.onrender.com/health` in a browser tab to wake the instance up so the demo is instantaneous.
> - Alternatively, configure a free monitor (e.g. UptimeRobot, cron-job.org) to ping `/health` every 10 minutes.

> [!NOTE]
> **Render Free PostgreSQL Retention & Backups**:
> - Render free databases expire after 30 days. To create a local snapshot backup at any time:
>   ```bash
>   pg_dump "postgresql://foodloop:<password>@<host>:5432/foodloop_db" > foodloop_backup.sql
>   ```
> - The database initialization in `seed_database()` is idempotent: it preserves all existing live data if rows are already present, and will only seed if tables are newly initialized.
