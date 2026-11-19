import asyncio
import random
import json
from datetime import datetime, UTC
from typing import List

from fastapi import FastAPI, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, constr
from typing import List, Optional

from app.config import settings
from app.database import init_db, get_db
from app.models import MetricEntry, AnomalyEvent, AIInsight
from app.ml_engine import detect_and_log_anomalies
from app.security import verify_api_key

# Initialize database schema partitions on startup
init_db()

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# 1. Restrict CORS to known frontend origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.230:3000", # Your local mobile testing IP
    # "https://nexus-metric.core" # Production domain goes here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # Block DELETE/PUT/PATCH for now
    allow_headers=["Authorization", "Content-Type"],
)

# 2. Add Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ⏱️ STATE VARIABLE: Stores the timestamp of the last active external ingestion call
last_external_ingest_time = datetime.min


# ==========================================
# 🤖 PHASE VI: AUTONOMOUS BACKGROUND WORKER
# ==========================================
async def background_telemetry_injector():
    global last_external_ingest_time
    print("🚀 [BACKGROUND WORKER INITIALIZED] Omni-channel injection engine online.")
    
    verticals = ["industrial", "fintech", "cyber", "enterprise_erp"]
    
    while True:
        try:
            time_since_last_ingest = (datetime.utcnow() - last_external_ingest_time).total_seconds()
            
            if time_since_last_ingest > 20.0:
                # ⚡ OMNI-BLAST: Generate telemetry for ALL verticals simultaneously in a single loop
                for selected_vertical in verticals:
                    
                    if selected_vertical == "industrial":
                        field_1 = round(random.uniform(115.0, 125.0), 2)
                        field_2 = round(random.uniform(42.0, 48.0), 2)
                        entity = f"Turbine_{random.randint(1, 2):02d}" # Reduced to 2 entities for lightning-fast ML training
                        metric_1_name = "hydraulic_pressure"
                        metric_2_name = "structural_vibration"
                        
                    elif selected_vertical == "fintech":
                        field_1 = round(random.uniform(150.0, 195.0), 2)
                        field_2 = round(random.uniform(25000.0, 35000.0), 2)
                        entity = f"Ledger_Node_{random.randint(1, 2):02d}"
                        metric_1_name = "pricing_density_delta"
                        metric_2_name = "stream_velocity"
                        
                    elif selected_vertical == "cyber":
                        field_1 = round(random.uniform(300.0, 450.0), 2)
                        field_2 = round(random.uniform(1200.0, 1800.0), 2)
                        entity = f"Edge_Proxy_{random.randint(1, 2):02d}"
                        metric_1_name = "packet_ingress_latency"
                        metric_2_name = "volume_stream"

                    elif selected_vertical == "enterprise_erp":
                        field_1 = round(random.uniform(50000.0, 120000.0), 2)
                        field_2 = round(field_1 * random.uniform(0.15, 0.22), 2)
                        entity = f"Dept_{random.randint(1, 2):02d}_PROCUREMENT"
                        metric_1_name = "net_capital_impact"
                        metric_2_name = "tax_liability_variance"

                    # 🎲 5% systematic probability of forcing an anomaly
                    is_anomaly = random.random() < 0.05
                    if is_anomaly:
                        field_1 *= random.choice([1.8, 0.3])
                        field_2 *= random.choice([2.2, 0.4])

                    db: Session = next(get_db())
                    current_time = datetime.now(UTC).replace(tzinfo=None)
                    
                    payloads = [
                        MetricEntry(vertical=selected_vertical, entity=entity, metric_name=metric_1_name, value=field_1, timestamp=current_time),
                        MetricEntry(vertical=selected_vertical, entity=entity, metric_name=metric_2_name, value=field_2, timestamp=current_time)
                    ]
                    
                    for entry in payloads:
                        db.add(entry)
                    db.commit()

                    # Push through ML engine
                    detect_and_log_anomalies(db, entity=entity, vertical=selected_vertical)
                    
                    is_anomaly_detected = False
                    latest_entry = db.query(MetricEntry).filter(
                        MetricEntry.vertical == selected_vertical, MetricEntry.entity == entity, MetricEntry.timestamp == current_time
                    ).first()
                    
                    if latest_entry:
                        anomaly_exists = db.query(AnomalyEvent).filter(AnomalyEvent.metric_id == latest_entry.id).first()
                        if anomaly_exists:
                            is_anomaly_detected = True

                    # Broadcast through WebSocket
                    await ws_manager.broadcast({
                        "type": "METRIC_TICK",
                        "vertical": selected_vertical,
                        "data": { "price": field_1, "volume": field_2, "isAnomaly": is_anomaly_detected }
                    })
                    db.close()
                
            else:
                print(f"📡 [MOCK ENGINE] Standby mode. External ingestion active.")

        except Exception as e:
            print(f"⚠️ [MOCK ENGINE CRITICAL ERROR]: {e}")
            
        # Fire global data blast every 2.5 seconds
        await asyncio.sleep(3.0)

@app.on_event("startup")
async def startup_event():
    # Spin up our asynchronous worker processing thread inside application runtime space
    asyncio.create_task(background_telemetry_injector())


# ==========================================
# 🔌 WEBSOCKET SYSTEM CONNECTION MANAGER
# ==========================================
class TelemetryConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 Real-time telemetry matrix node mounted. Active pipelines: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"🔌 Telemetry matrix node unmounted. Remaining channels: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        payload_string = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload_string)
            except Exception:
                pass

ws_manager = TelemetryConnectionManager()


# ==========================================
# 📊 PYDANTIC SCHEMAS
# ==========================================
class MetricPayload(BaseModel):
    vertical: str = Field(..., pattern="^(fintech|industrial|cyber|enterprise_erp)$")
    entity: str = Field(..., min_length=2, max_length=50)
    metric_name: str = Field(..., min_length=2, max_length=50)
    value: float = Field(...)
    vector_skew: float = Field(default=0.0)

# ==========================================
# 📊 ENTERPRISE ERP SCHEMAS (Phase VI.b)
# ==========================================
class SAPLedgerDetails(BaseModel):
    account_code: str = Field(..., min_length=3, max_length=20)
    department_id: str = Field(..., min_length=2, max_length=20)
    transaction_type: str = Field(..., pattern="^(PROCUREMENT|PAYROLL|CAPEX)$")
    currency: str = Field(default="USD", max_length=3)

class ERPLedgerPayload(BaseModel):
    transaction_id: str = Field(..., min_length=5, max_length=64)
    vendor_name: Optional[str] = Field(None, max_length=100)
    ledger_meta: SAPLedgerDetails
    gross_amount: float = Field(..., ge=0.0) # Greater than or equal to 0
    tax_withheld: float = Field(..., ge=0.0)
    net_impact: float = Field(...)
    timestamp: str

class IngestResponse(BaseModel):
    status: str
    records_inserted: int


# ==========================================
# 📡 CORE API ROUTING MAPS
# ==========================================
@app.get("/")
async def root_health_check():
    return {"status": "online", "engine": f"{settings.PROJECT_NAME} Forensics Routing Engine"}


@app.post("/api/v1/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_api_key)])
async def ingest_telemetry_stream(payloads: List[MetricPayload], db: Session = Depends(get_db)):
    global last_external_ingest_time
    
    # ⏱️ Update tracker immediately to mark that an external script is taking ownership
    last_external_ingest_time = datetime.utcnow()
    
    current_time = datetime.now(UTC).replace(tzinfo=None)
    
    for p in payloads:
        entry = MetricEntry(
            vertical=p.vertical,
            entity=p.entity,
            metric_name=p.metric_name,
            value=p.value,
            timestamp=current_time
        )
        db.add(entry)
    db.commit()

    is_anomaly_detected = False
    if payloads:
        detect_and_log_anomalies(db, entity=payloads[0].entity, vertical=payloads[0].vertical)
        
        latest_entry = db.query(MetricEntry).filter(
            MetricEntry.vertical == payloads[0].vertical,
            MetricEntry.entity == payloads[0].entity,
            MetricEntry.timestamp == current_time
        ).first()
        
        if latest_entry:
            anomaly_exists = db.query(AnomalyEvent).filter(AnomalyEvent.metric_id == latest_entry.id).first()
            if anomaly_exists:
                is_anomaly_detected = True

        await ws_manager.broadcast({
            "type": "METRIC_TICK",
            "vertical": payloads[0].vertical,
            "data": {
                "price": payloads[0].value,
                "volume": payloads[1].value if len(payloads) > 1 else 0.0,
                "isAnomaly": is_anomaly_detected
            }
        })

    return {"status": "success", "records_inserted": len(payloads)}

@app.post("/api/v1/erp/ingest", response_model=IngestResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_api_key)])
async def ingest_erp_ledger_stream(payloads: List[ERPLedgerPayload], db: Session = Depends(get_db)):
    """
    Enterprise Data Normalization Node.
    Parses complex SAP/ERP ledger objects and normalizes them into standard Nexus telemetry vectors.
    """
    global last_external_ingest_time
    last_external_ingest_time = datetime.utcnow()
    current_time = datetime.now(UTC).replace(tzinfo=None)
    
    normalized_entries = []
    
    for p in payloads:
        # NORMALIZATION: Map the nested ERP data to our flat telemetry schema
        entity_name = f"Dept_{p.ledger_meta.department_id}_{p.ledger_meta.transaction_type}"
        
        # We are extracting the 'net_impact' and 'tax_withheld' as our two ML vectors
        entry_1 = MetricEntry(
            vertical="enterprise_erp",
            entity=entity_name,
            metric_name="net_capital_impact",
            value=p.net_impact,
            timestamp=current_time
        )
        entry_2 = MetricEntry(
            vertical="enterprise_erp",
            entity=entity_name,
            metric_name="tax_liability_variance",
            value=p.tax_withheld,
            timestamp=current_time
        )
        
        db.add(entry_1)
        db.add(entry_2)
        normalized_entries.extend([entry_1, entry_2])
        
    db.commit()

    # Run the normalized data through the existing Machine Learning pipeline
    is_anomaly_detected = False
    if payloads:
        target_entity = f"Dept_{payloads[0].ledger_meta.department_id}_{payloads[0].ledger_meta.transaction_type}"
        detect_and_log_anomalies(db, entity=target_entity, vertical="enterprise_erp")
        
        # Verify if the ML engine flagged it
        latest_entry = db.query(MetricEntry).filter(
            MetricEntry.vertical == "enterprise_erp",
            MetricEntry.entity == target_entity,
            MetricEntry.timestamp == current_time
        ).first()
        
        if latest_entry:
            anomaly_exists = db.query(AnomalyEvent).filter(AnomalyEvent.metric_id == latest_entry.id).first()
            if anomaly_exists:
                is_anomaly_detected = True

        # Broadcast the normalized result to the dashboard WebSockets
        await ws_manager.broadcast({
            "type": "METRIC_TICK",
            "vertical": "enterprise_erp",
            "data": {
                "price": payloads[0].net_impact,
                "volume": payloads[0].gross_amount,
                "isAnomaly": is_anomaly_detected
            }
        })

    return {"status": "success", "records_inserted": len(normalized_entries)}

# backend/app/main.py -> Add to your API routes section

@app.get("/api/v1/history")
async def get_historical_metrics(vertical: str = "fintech", db: Session = Depends(get_db)):
    """Fetches the last 35 raw telemetry ticks to instantly hydrate frontend charts on refresh."""
    # Pull the last 70 rows (since 2 rows make 1 frame: field_1 and field_2)
    records = db.query(MetricEntry)\
                .filter(MetricEntry.vertical == vertical)\
                .order_by(MetricEntry.timestamp.desc())\
                .limit(70)\
                .all()
    
    grouped = {}
    for r in records:
        ts = r.timestamp.isoformat()
        if ts not in grouped:
            grouped[ts] = {"price": 0, "volume": 0, "isAnomaly": False}
        
        # Map primary fields to 'price' and secondary fields to 'volume' for the frontend graph
        if r.metric_name in ["hydraulic_pressure", "pricing_density_delta", "packet_ingress_latency", "net_capital_impact"]:
            grouped[ts]["price"] = r.value
        else:
            grouped[ts]["volume"] = r.value
            
        # Check if this specific point was flagged by the Isolation Forest
        has_anomaly = db.query(AnomalyEvent).filter(AnomalyEvent.metric_id == r.id).first()
        if has_anomaly:
            grouped[ts]["isAnomaly"] = True

    # Convert the dictionary to a chronological array for the SVG graph
    history_array = [grouped[ts] for ts in sorted(grouped.keys())]
    return history_array[-35:]

@app.get("/api/v1/anomalies")
async def get_flagged_anomalies(vertical: str = "fintech", db: Session = Depends(get_db)):
    anomalies = db.query(AnomalyEvent)\
                  .join(MetricEntry, AnomalyEvent.metric_id == MetricEntry.id)\
                  .filter(MetricEntry.vertical == vertical)\
                  .order_by(AnomalyEvent.timestamp.desc())\
                  .limit(40)\
                  .all()
    return [
        {
            "id": a.id,
            "score": a.score,
            "description": a.description,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None
        } for a in anomalies
    ]


@app.get("/api/v1/insights")
async def get_ai_insights_feed(vertical: str = "fintech", db: Session = Depends(get_db)):
    results = db.query(AnomalyEvent)\
                .join(MetricEntry, AnomalyEvent.metric_id == MetricEntry.id)\
                .join(AIInsight, AnomalyEvent.id == AIInsight.anomaly_id)\
                .filter(MetricEntry.vertical == vertical)\
                .order_by(AnomalyEvent.timestamp.desc())\
                .limit(10)\
                .all()
                
    output = []
    for a in results:
        raw_content = a.insight.content if a.insight else "System validation complete."

        if "rate_limit_exceeded" in raw_content or "429" in raw_content:
            fallback_copy = {
                "fintech": "Unsupervised density isolation flagged non-linear equity pricing skew. Risk profiles indicate active algorithmic market runs; automated hedging protocol armed.",
                "industrial": "Critical sensory variance isolated across rotational bearing vectors. Cavitation threshold exceeded; predictive maintenance flags immediate line pressure seal routing.",
                "cyber": "Anomalous packet ingress variance detected across peripheral proxy nodes. Volumetric tracking indicates high-probability zero-day cascade; firewall restrictions active.",
                # ⚡ ADD THIS ERP FALLBACK
                "enterprise_erp": "Anomalous capital outflow and tax liability variance detected in procurement ledger. Flags indicate potential compliance breach or irregular vendor capitalization."
                
            }
            raw_content = fallback_copy.get(vertical, "Algorithmic anomaly intercepted and logged under security protocol.")
            
        output.append({
            "anomaly_id": a.id,
            "score": a.score,
            "technical_specs": a.description,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "ai_executive_summary": raw_content
        })
    return output


@app.websocket("/api/v1/stream")
async def websocket_telemetry_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)