'use client';

import React from 'react';

interface SystemStatusWidgetProps {
  glowColor: string;
}

export default function SystemStatusWidget({ glowColor }: SystemStatusWidgetProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[24px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-white/50 tracking-widest font-mono">NETWORK</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[9px] text-white/60 tracking-widest font-mono">ONLINE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-white/50 tracking-widest font-mono">AI CORE</span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${glowColor} shadow-[0_0_8px_currentColor] animate-pulse`} />
            <span className="text-[9px] text-white/60 tracking-widest font-mono">ACTIVE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-white/50 tracking-widest font-mono">MONITORING</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            <span className="text-[9px] text-white/60 tracking-widest font-mono">LIVE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-white/50 tracking-widest font-mono">UPTIME</span>
          <span className="text-[9px] text-white/60 tracking-widest font-mono">99.98%</span>
        </div>
      </div>
    </div>
  );
}