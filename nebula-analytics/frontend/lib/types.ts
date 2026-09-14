// --- Types & Interfaces ---
export interface MetricPoint {
  price: number;
  volume: number;
  isAnomaly: boolean;
  timestamp: number;
}

export interface AnomalyInsight {
  anomaly_id: number;
  score: number;
  technical_specs: string;
  timestamp: string;
  ai_executive_summary: string;
}

export type VerticalType = 'home' | 'fintech' | 'industrial' | 'cyber' | 'enterprise';
export type TimeRange = '1H' | '24H' | '7D' | '30D' | 'LIVE';
export type LogSeverity = 'All' | 'Critical' | 'Warning' | 'Info' | 'Resolved';

export interface LogEntry {
  id: string;
  time: string;
  severity: LogSeverity;
  source: string;
  event: string;
  details?: string;
}

export interface KPIMetric {
  label: string;
  unit: string;
  isCurrency: boolean;
  derive: (price: number, volume: number) => number;
}

export interface VerticalConfig {
  title: string;
  tagline: string;
  description: string;
  entity: string;
  stroke: string;
  glow: string;
  heroPills: Array<{ label: string; value: string }>;
  events: string[];
  kpis: KPIMetric[];
}

export interface VerticalConfigs {
  [key: string]: VerticalConfig;
}