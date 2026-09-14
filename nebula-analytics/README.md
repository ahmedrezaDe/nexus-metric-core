# NEXUS METRIC CORE // INDUSTRIAL TELEMETRY

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge\&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge\&logo=fastapi)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Isolation_Forest-f39c12?style=for-the-badge\&logo=scikit-learn)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge\&logo=postgresql)

Nexus Metric Core is a Python-based telemetry and monitoring system that generates synthetic data, stores it in PostgreSQL, processes it with Scikit-Learn Isolation Forest for anomaly detection, and passes detected anomalies to either local Mistral inference or Groq for analysis.

The system provides an experimental environment for exploring how machine learning and language models can complement conventional engineering-data workflows.

---

## Architecture

### Telemetry Generation

An asynchronous background worker generates synthetic telemetry across multiple monitoring domains:

- **Industrial:** Hydraulic pressure, structural vibration
- **Fintech:** Pricing density delta, stream velocity
- **Cyber:** Packet ingress latency, volume stream
- **Enterprise ERP:** Net capital impact, tax liability variance

The generator creates controlled variation over time and injects anomalous states with a 5% probability to provide controlled test data for anomaly detection workflows.

### Anomaly Detection

The telemetry is processed using a Scikit-Learn `IsolationForest` model. The model operates on two-dimensional feature vectors per domain to identify patterns that differ from the expected simulated states.

### Analysis Workflow

Detected anomalies are converted into structured payloads and passed to an LLM-based text generation workflow.

The system supports configurable inference through:

- **Local Mistral inference** using `llama.cpp`
- **Cloud-based inference** using Groq

The LLM generates domain-specific analysis text based on the anomaly context, including entity, metrics, scores, and timestamps.

### Backend and Storage

The backend is built around:

- **FastAPI** with WebSocket support
- **SQLAlchemy** ORM for database operations
- **PostgreSQL** for data persistence
- **Docker Compose** for containerized deployment

The Docker environment uses a TimescaleDB-compatible PostgreSQL image, but the application currently uses standard PostgreSQL functionality rather than TimescaleDB-specific features.

### Frontend

A Next.js monitoring interface provides visualization for telemetry data.

The current frontend implementation uses locally generated development data and does not yet consume the backend WebSocket.

---

## System Flow

```text
Synthetic Telemetry Generation
        ↓
PostgreSQL Storage
        ↓
Isolation Forest Anomaly Detection
        ↓
Anomaly Record Creation
        ↓
LLM Analysis (local or cloud)
        ↓
FastAPI / WebSocket Broadcasting
        ↓
Frontend
(currently uses local development data)
```

---

## Local Setup

### 1. Start the database

```bash
docker-compose up nexus-db
```

### 2. Configure the environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/nebula_db
```

If you want to use cloud inference instead of local inference, also configure:

```env
INFERENCE_MODE=cloud
GROQ_API_KEY=your_api_key
```

### 3. Start the backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 4. Start the local LLM server (optional)

For local Mistral inference:

```bash
cd backend

python -m llama_cpp.server \
  --model ./models/Mistral-7B-Instruct-v0.3.Q4_K_M.gguf \
  --host 127.0.0.1 \
  --port 8080 \
  --n_ctx 2048 \
  --n_gpu_layers -1
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

---

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for planned development phases.

---

## Future Work

Potential directions include:

* Parameterized physical-system models
* Controlled and reproducible simulation scenarios
* Comparison of conventional analysis with machine-learning approaches
* Engineering simulation workflows
* Integration with physics-based simulation tools
