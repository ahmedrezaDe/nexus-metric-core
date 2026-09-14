import React from 'react';
import { CheckCircle, Zap, RefreshCw } from 'lucide-react';

interface GlobalStatusBarProps {
  eventsPerMin: number;
  currentTime: string;
}

export default function GlobalStatusBar({ eventsPerMin, currentTime }: GlobalStatusBarProps) {
  return (
    <div className="hidden md:flex fixed top-[90px] left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-[1750px] items-center justify-between px-8 py-2 text-[10px] font-mono text-white/40 tracking-widest uppercase bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-emerald-500" /> 
          System Operational
        </span>
        <span>Nodes: 128</span>
        <span>Latency: 12ms</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-amber-500" /> 
          Events/Min: {eventsPerMin.toLocaleString()}
        </span>
        <span className="flex items-center gap-2">
          Sync: Live 
          <RefreshCw className="w-3 h-3 inline ml-1 animate-spin" />
        </span>
      </div>
    </div>
  );
}