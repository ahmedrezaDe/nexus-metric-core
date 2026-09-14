'use client';

import React from 'react';
import { BarChart3, Activity, ShieldAlert, Clock, TrendingUp, Zap, Server, CheckCircle } from 'lucide-react';

interface AnalyticsViewProps {
  activeVertical: string;
  glowColor: string;
}

export default function AnalyticsView({ activeVertical, glowColor }: AnalyticsViewProps) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Analytics Header */}
      <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 border border-white/10 bg-white/[0.03] px-3 py-1.5 rounded-[12px]">
              System Analytics
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight text-white capitalize">{activeVertical} Intelligence</h2>
          <p className="text-sm text-white/50 font-light tracking-wide">Historical performance, resolution metrics, and event distribution.</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
           <div className="px-6 py-4 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[24px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
             <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium block mb-1">MTTR (Mean Time To Resolve)</span>
             <span className="text-2xl font-light text-white font-mono">4m 12s</span>
           </div>
        </div>
      </section>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events (24h)', value: '14,293', trend: '+12.5%', icon: Activity },
          { label: 'Critical Deviations', value: '24', trend: '-2.4%', icon: ShieldAlert, alert: true },
          { label: 'Resolution Rate', value: '98.2%', trend: '+0.8%', icon: CheckCircle },
          { label: 'System Uptime', value: '99.99%', trend: 'Stable', icon: Server }
        ].map((kpi, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] flex flex-col justify-between relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[11px] font-medium tracking-wide text-white/50">{kpi.label}</span>
               <kpi.icon className={`w-4 h-4 ${kpi.alert ? 'text-red-400' : 'text-white/40'}`} />
             </div>
             <div className="flex items-end justify-between">
               <span className="text-3xl font-light text-white tracking-tight font-mono">{kpi.value}</span>
               <span className={`text-[10px] font-medium px-2 py-1 rounded-[8px] ${kpi.trend.includes('-') && kpi.alert ? 'bg-emerald-500/10 text-emerald-400' : kpi.trend.includes('-') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                 {kpi.trend}
               </span>
             </div>
          </div>
        ))}
      </section>

      {/* Deep Dive Charts Area (Placeholders for real integration) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] min-h-[400px] flex flex-col">
          <h3 className="text-lg font-medium text-white tracking-tight mb-6">Event Severity Distribution</h3>
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-[24px] bg-white/[0.01]">
             <p className="text-sm text-white/30 font-light flex items-center gap-2">
               <BarChart3 className="w-4 h-4" /> Awaiting aggregation pipeline...
             </p>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] min-h-[400px] flex flex-col">
          <h3 className="text-lg font-medium text-white tracking-tight mb-6">Cross-Domain Comparison</h3>
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-[24px] bg-white/[0.01]">
             <p className="text-sm text-white/30 font-light flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Awaiting comparative dataset...
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}