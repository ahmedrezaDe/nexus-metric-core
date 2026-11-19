import { VerticalConfig, VerticalConfigs } from './types';

export const verticalConfigs: VerticalConfigs = {
  home: { 
    title: "", 
    tagline: "", 
    description: "", 
    entity: "", 
    stroke: "", 
    glow: "", 
    kpis: [], 
    heroPills: [], 
    events: [] 
  },
  fintech: {
    title: "Quantitative Capital", 
    tagline: "Non-Linear Volatility Insulation", 
    description: "Real-time order-book imbalances and liquidity exhaustion.",
    entity: "CAP_VECTOR.AAPL", 
    stroke: "#00E5A8", 
    glow: "bg-[#00E5A8]",
    heroPills: [
      { label: "Active Asset", value: "AAPL.US" }, 
      { label: "Market State", value: "Volatile" },
      { label: "Signal Strength", value: "Strong" }, 
      { label: "Risk Class", value: "Tier 1" }
    ],
    events: ["Trade executed block", "Risk threshold approached", "Market volatility spike", "Liquidity pool adjusted"],
    kpis: [
      { label: "Portfolio Value", unit: "$", isCurrency: true, derive: (p: number) => p * 125000 },
      { label: "Daily P&L", unit: "$", isCurrency: true, derive: (p: number, v: number) => (p - 100) * v * 10 },
      { label: "Trade Volume", unit: "", isCurrency: false, derive: (_: number, v: number) => v * 45 },
      { label: "Value at Risk", unit: "%", isCurrency: false, derive: (p: number) => (p / 200) * 2.5 },
      { label: "Sharpe Ratio", unit: "", isCurrency: false, derive: (p: number) => 1.5 + (p % 10) / 10 },
      { label: "Exposure", unit: "$", isCurrency: true, derive: (p: number) => p * 35000 }
    ]
  },
  industrial: {
    title: "SCADA Infrastructure", 
    tagline: "Predictive Kinematic Forensics", 
    description: "Fluid hydraulic head-loss and torsional fatigue analytics.",
    entity: "TURBINE_KINETICS.04", 
    stroke: "#FFA000", 
    glow: "bg-[#FFA000]",
    heroPills: [
      { label: "Active Facility", value: "Sector 4" }, 
      { label: "Equipment", value: "Nominal" },
      { label: "Failure Prob", value: "1.2%" }, 
      { label: "Maintenance", value: "Scheduled" }
    ],
    events: ["Pressure anomaly isolated", "Temperature threshold safe", "Pump vibration normal", "Harmonic resonance check"],
    kpis: [
      { label: "Pump Pressure", unit: " PSI", isCurrency: false, derive: (p: number) => p },
      { label: "Turbine RPM", unit: "", isCurrency: false, derive: (_: number, v: number) => v * 85 },
      { label: "Bearing Temp", unit: "°C", isCurrency: false, derive: (p: number) => 40 + (p / 4) },
      { label: "Flow Rate", unit: " L/m", isCurrency: false, derive: (_: number, v: number) => v * 12 },
      { label: "Energy Usage", unit: " MW", isCurrency: false, derive: (p: number) => (p / 100) * 1.5 },
      { label: "Maintenance Risk", unit: "%", isCurrency: false, derive: (_: number, v: number) => Math.min(100, v / 2) }
    ]
  },
  cyber: {
    title: "Distributed Forensics", 
    tagline: "Perimeter Threat Countermeasures", 
    description: "Asynchronous packet fragmentation against volumetric spikes.",
    entity: "EDGE_ROUTING.NODE_A", 
    stroke: "#6C63FF", 
    glow: "bg-[#6C63FF]",
    heroPills: [
      { label: "Network Zone", value: "DMZ-Alpha" }, 
      { label: "Threat Level", value: "Elevated" },
      { label: "Security State", value: "Active" }, 
      { label: "Attack Surface", value: "Expansive" }
    ],
    events: ["Threat signature flagged", "DDoS mitigation active", "Firewall ruleset synced", "Auth token validated"],
    kpis: [
      { label: "Active Threats", unit: "", isCurrency: false, derive: (p: number) => Math.floor(p % 5) },
      { label: "Requests/sec", unit: "", isCurrency: false, derive: (_: number, v: number) => v * 312 },
      { label: "Throughput", unit: " GB/s", isCurrency: false, derive: (p: number) => (p / 50) },
      { label: "Firewall Events", unit: "", isCurrency: false, derive: (_: number, v: number) => v * 180 },
      { label: "Blocked Conns", unit: "", isCurrency: false, derive: (p: number, v: number) => p * v },
      { label: "Risk Score", unit: "/100", isCurrency: false, derive: (p: number) => Math.min(100, Math.max(0, p - 50)) }
    ]
  },
  enterprise: {
    title: "Enterprise ERP Ledger", 
    tagline: "ERP Normalization & Liability", 
    description: "Corporate accounting payloads and automated capital impacts.",
    entity: "SAP.ERP_LEDGER", 
    stroke: "#18A8FF", 
    glow: "bg-[#18A8FF]",
    heroPills: [
      { label: "Department", value: "Procurement" }, 
      { label: "Process Health", value: "Optimal" },
      { label: "Compliance", value: "Verified" }, 
      { label: "Efficiency", value: "94.2%" }
    ],
    events: ["Invoice batch processed", "Budget variance check", "Procurement authorized", "Audit trail committed"],
    kpis: [
      { label: "Revenue", unit: "$", isCurrency: true, derive: (p: number) => p * 850 },
      { label: "Expenses", unit: "$", isCurrency: true, derive: (_: number, v: number) => v * 400 },
      { label: "Cash Flow", unit: "$", isCurrency: true, derive: (p: number, v: number) => (p * 850) - (v * 400) },
      { label: "Spend", unit: "$", isCurrency: true, derive: (p: number) => p * 200 },
      { label: "Open Invoices", unit: "", isCurrency: false, derive: (_: number, v: number) => Math.floor(v / 2) },
      { label: "Efficiency", unit: "%", isCurrency: false, derive: (p: number) => Math.min(99.9, 80 + (p % 20)) }
    ]
  }
};