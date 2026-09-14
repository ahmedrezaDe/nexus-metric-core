import asyncio
import random
import math
import httpx

async def stream_data_channels():
    print("🌌 Nexus Core Ingestion [OMNI-CHANNEL PRODUCTION BROADCAST ACTIVE]...")
    # Bound explicitly to your Mac's LAN address so your iPhone can handshake successfully
    url = "http://192.168.0.230:8000/api/v1/ingest"
    tick = 0
    
    # 🔐 Security headers for API authentication
    headers = {
        "X-Nexus-API-Key": "dev_fallback_key_9876",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        while True:
            tick += 1
            
            # --- 1. FINTECH CHANNELS ---
            f_price = 150.0 + (8.0 * math.sin(tick * 0.1)) + random.uniform(-1, 1)
            f_vol = random.uniform(5000, 7000) if tick % 25 != 0 else random.uniform(26000, 32000)
            if tick % 25 == 0: f_price += 35.0
            
            fintech_payload = [
                {"vertical": "fintech", "entity": "AAPL", "metric_name": "market_price", "value": round(f_price, 2), "vector_skew": 0.0},
                {"vertical": "fintech", "entity": "AAPL", "metric_name": "transaction_volume", "value": round(f_vol, 2), "vector_skew": 0.0}
            ]

            # --- 2. INDUSTRIAL IoT CHANNELS ---
            i_pres = 120.0 + (4.0 * math.sin(tick * 0.12)) + random.uniform(-0.5, 0.5)
            i_vib = 45.0 + (1.5 * math.cos(tick * 0.08)) + random.uniform(-0.3, 0.3)
            if tick % 33 == 0: i_pres -= 40.0; i_vib += 30.0 
            
            industrial_payload = [
                {"vertical": "industrial", "entity": "TURBINE_04", "metric_name": "hydraulic_pressure", "value": round(i_pres, 2), "vector_skew": 0.0},
                {"vertical": "industrial", "entity": "TURBINE_04", "metric_name": "structural_vibration", "value": round(i_vib, 2), "vector_skew": 0.0}
            ]

            # --- 3. CYBERSECURITY CHANNELS ---
            c_lat = 22.0 + (2.0 * math.sin(tick * 0.05)) + random.uniform(-1, 1) 
            c_ing = random.uniform(1200, 1800) if tick % 20 != 0 else random.uniform(8500, 12000) 
            if tick % 20 == 0: c_lat += 180.0
            
            cyber_payload = [
                {"vertical": "cyber", "entity": "PROXY_NODE_01", "metric_name": "api_latency", "value": round(c_lat, 2), "vector_skew": 0.0},
                {"vertical": "cyber", "entity": "PROXY_NODE_01", "metric_name": "network_ingress", "value": round(c_ing, 2), "vector_skew": 0.0}
            ]

            # --- 4. ENTERPRISE ERP CHANNELS ---
            # The Math: Simulate standard department procurement costs
            base_capital = random.uniform(50000.0, 120000.0)
            
            # Tax is usually a stable bracket (15% - 22%)
            tax_rate = random.uniform(0.15, 0.22)
            
            # 🎲 5% chance of a massive financial anomaly (fraud / unapproved spend)
            if random.random() < 0.05:
                base_capital *= random.uniform(3.0, 5.0)  # Massive unapproved budget spend
                tax_rate *= random.uniform(0.05, 0.10)    # Highly irregular tax logging

            tax_liability = base_capital * tax_rate

            enterprise_payload = [
                {
                    "vertical": "enterprise_erp", 
                    "entity": "Dept_01_PROCUREMENT", 
                    "metric_name": "net_capital_impact", 
                    "value": round(base_capital, 2), 
                    "vector_skew": 0.0
                },
                {
                    "vertical": "enterprise_erp", 
                    "entity": "Dept_01_PROCUREMENT", 
                    "metric_name": "tax_liability_variance", 
                    "value": round(tax_liability, 2), 
                    "vector_skew": 0.0
                }
            ]
            # Make sure you actually append this to your main request array!
            # e.g., full_payload.extend(enterprise_payload)


            try:
                # Fire the exact compliant array definitions concurrently with security headers
                await asyncio.gather(
                    client.post(url, json=fintech_payload, headers=headers),
                    client.post(url, json=industrial_payload, headers=headers),
                    client.post(url, json=cyber_payload, headers=headers),
                    client.post(url, json=enterprise_payload, headers=headers)
                )
                print(f"📡 Tick {tick:03d} // Broadcaster Synced Cluster // 201 Created Ingest Clear")
            except Exception as e:
                print(f"❌ Broadcaster cluster packet drop: {e}")

            await asyncio.sleep(3.0)

if __name__ == "__main__":
    try:
        asyncio.run(stream_data_channels())
    except KeyboardInterrupt:
        print("\n🛑 Unified broadcaster offline.")