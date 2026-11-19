# How Nexus Metric Core Works

## What is it?

Nexus Metric Core is a synthetic telemetry monitoring system that:
- Generates fake industrial/fintech/cyber/ERP data
- Stores it in PostgreSQL
- Detects anomalies using Isolation Forest
- Sends anomalies to an LLM for text analysis
- Provides a Next.js dashboard (currently using mock data)

It's an experimental environment for testing ML + LLM workflows on engineering data.

---

## How do I start it?

### Full Stack (Docker)
```bash
docker-compose up
```
This starts: PostgreSQL (TimescaleDB image), FastAPI backend, Next.js frontend

### Backend Only
```bash
cd backend
uvicorn app.main:app --reload
```

### Local LLM Server (optional)
```bash
python -m llama_cpp.server \
  --model ./models/Mistral-7B-Instruct-v0.3.Q4_K_M.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  --n_ctx 2048 \
  --n_gpu_layers -1
```

### Frontend Only
```bash
cd frontend
npm run dev
```

---

## Where does telemetry originate?

### Primary Source: Background Worker
**File:** `backend/app/main.py` → `background_telemetry_injector()`

- Runs automatically on FastAPI startup
- Generates data every 3 seconds for all 4 verticals
- Creates synthetic data with controlled random variation
- Injects anomalies 5% of the time (multiplies values by 1.8/0.3/2.2/0.4)

### Secondary Source: External Script
**File:** `backend/scripts/data_streamer.py`

- Optional external script that POSTs to `/api/v1/ingest`
- Uses the same 5% anomaly injection logic
- Requires API key: `X-Nexus-API-Key: dev_fallback_key_9876`

### Data Generated Per Vertical:
- **Industrial:** `hydraulic_pressure`, `structural_vibration`
- **Fintech:** `pricing_density_delta`, `stream_velocity`
- **Cyber:** `packet_ingress_latency`, `volume_stream`
- **Enterprise ERP:** `net_capital_impact`, `tax_liability_variance`

---

## Where is it stored?

### Database: PostgreSQL
**File:** `backend/app/database.py`

- Uses SQLAlchemy ORM
- Connection string: `postgresql+psycopg://postgres:postgres@nexus-db:5432/nebula_db`
- Docker service: `nexus-db` (TimescaleDB image, but using standard PostgreSQL)

### Tables:
**File:** `backend/app/models.py`

1. **`metrics`** - Raw telemetry entries
   - `id`, `vertical`, `entity`, `metric_name`, `value`, `timestamp`
   
2. **`anomalies`** - Detected anomalies
   - `id`, `metric_id` (FK), `score`, `description`, `timestamp`
   
3. **`ai_insights`** - LLM-generated analysis
   - `id`, `anomaly_id` (FK), `content`

### Schema Creation:
- Auto-generated on startup via `Base.metadata.create_all()`
- No Alembic migrations currently
- No TimescaleDB hypertables or time_bucket functions

---

## Where does Isolation Forest run?

### Location: Backend ML Engine
**File:** `backend/app/ml_engine.py` → `detect_and_log_anomalies()`

### When it runs:
- Called after every telemetry batch insertion
- Processes the last 100 records per entity/vertical
- Trains a NEW Isolation Forest model on every call (inefficient but functional)

### Configuration:
```python
model = IsolationForest(contamination=0.05, random_state=42)
```

### Features:
- 2 features per vertical (e.g., hydraulic_pressure + structural_vibration)
- Vertical-specific feature mapping in `feature_keys` dictionary

### Output:
- Anomaly score (multiplied by 10.0 for display)
- Description with raw metric values
- Database record in `anomalies` table

---

## Where does the LLM run?

### Local Mode: llama.cpp Server
**File:** `backend/app/llm_service.py` → `generate_executive_summary()`

- Target: `http://192.168.0.230:8080/v1/chat/completions`
- Model: `mistral-7b`
- Requires local llama.cpp server running separately
- Uses your LAN IP for mobile device access

### Cloud Mode: Groq API
**File:** `backend/app/llm_service.py` → `generate_executive_summary()`

- Target: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile` (configurable)
- Requires `GROQ_API_KEY` in environment
- Fallback to canned text if API fails

### When LLM is called:
- Only when an anomaly is detected by Isolation Forest
- Context: entity, metrics, anomaly score, timestamp
- Output: 2-sentence domain-specific analysis text
- Stored in `ai_insights` table

---

## How does local vs Groq routing work?

### Configuration:
**File:** `backend/app/config.py`

```python
INFERENCE_MODE: str = "local"  # or "cloud"
CLOUD_PROVIDER: str = "groq"
CLOUD_API_KEY: Optional[str] = None
LOCAL_LLM_URL: str = "http://127.0.0.1:8080/v1/chat/completions"
```

### Routing Logic:
**File:** `backend/app/llm_service.py`

```python
if self.mode == "local":
    # Try llama.cpp server URLs
    # Failover chain if connection fails
elif self.mode == "cloud" and self.cloud_key:
    # Use Groq API
else:
    # Return fallback canned text
```

### Environment Variables:
- `INFERENCE_MODE=local` or `INFERENCE_MODE=cloud`
- `GROQ_API_KEY=your_key_here` (for cloud mode)

---

## How does the frontend currently work?

### Current State: MOCK DATA
**File:** `frontend/app/page.tsx` → `generatePoint()`

The frontend does **NOT** connect to the backend WebSocket. Instead:

1. Generates local mock data using `Math.random()`
2. Simulates 4 verticals with different base values
3. Creates fake anomalies (5% probability)
4. Updates UI every 2 seconds via `setInterval`

### Backend WebSocket (Unused by Frontend):
**File:** `backend/app/main.py` → `TelemetryConnectionManager`

- WebSocket endpoint: `/api/v1/stream`
- Broadcasts real telemetry to connected clients
- Currently functional but not consumed by frontend

### To Connect Frontend to Backend:
- Replace `generatePoint()` with WebSocket connection
- Subscribe to `/api/v1/stream`
- Parse incoming METRIC_TICK messages
- Remove local `setInterval` mock generation

---

## What are the important files?

### Backend Core:
- `backend/app/main.py` - FastAPI app, background worker, WebSocket, API routes
- `backend/app/database.py` - SQLAlchemy setup, session management
- `backend/app/models.py` - Database models (metrics, anomalies, ai_insights)
- `backend/app/ml_engine.py` - Isolation Forest anomaly detection
- `backend/app/llm_service.py` - LLM routing and text generation
- `backend/app/config.py` - Configuration and environment variables
- `backend/app/security.py` - API key authentication

### Backend Scripts:
- `backend/scripts/data_streamer.py` - Optional external telemetry generator

### Frontend Core:
- `frontend/app/page.tsx` - Main dashboard UI (currently using mock data)
- `frontend/lib/verticalConfig.ts` - Vertical-specific configurations
- `frontend/lib/types.ts` - TypeScript interfaces

### Infrastructure:
- `docker-compose.yml` - Docker services (nexus-db, nexus-backend, nexus-frontend)
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies

---

## What should I NOT touch?

### Breaking Changes:
- **Database name `nebula_db`** - Requires volume migration, could break existing data
- **Database schema** - No migration system, changes could corrupt data
- **API contract** - External scripts may depend on current endpoints
- **Docker service names** - `nexus-db`, `nexus-backend`, `nexus-frontend`

### Complex Areas:
- **ML model training** - Currently retrains on every request, changing this requires refactoring
- **LLM prompt engineering** - Personas are finely tuned per vertical
- **WebSocket protocol** - Message format is specific, changes break compatibility

### Leave For Later:
- **Frontend-backend connection** - Requires significant refactoring of page.tsx
- **TimescaleDB features** - Currently unused, adding requires schema changes
- **Model persistence** - Requires adding model serialization/deserialization

### Safe Areas to Modify:
- **README documentation** - Keep it accurate
- **Vertical configurations** - Add new verticals in verticalConfig.ts
- **LLM personas** - Adjust text generation style in llm_service.py
- **Mock data generation** - Frontend generatePoint() function
- **API endpoints** - Add new routes, but don't change existing ones

---

## Quick Reference

### Verticals:
- `fintech` - Financial data
- `industrial` - Industrial equipment
- `cyber` - Network security
- `enterprise_erp` - Enterprise resource planning

### API Endpoints:
- `POST /api/v1/ingest` - Ingest telemetry (requires API key)
- `POST /api/v1/erp/ingest` - Ingest ERP data (requires API key)
- `GET /api/v1/history` - Get historical metrics
- `GET /api/v1/anomalies` - Get detected anomalies
- `GET /api/v1/insights` - Get AI-generated insights
- `WS /api/v1/stream` - WebSocket telemetry stream

### Environment Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXUS_SERVICE_KEY` - API key for ingestion
- `INFERENCE_MODE` - "local" or "cloud"
- `GROQ_API_KEY` - Groq API key (cloud mode)

### Ports:
- `3000` - Frontend (Next.js)
- `8000` - Backend (FastAPI)
- `5432` - Database (PostgreSQL)
- `8080` - Local LLM (llama.cpp)
