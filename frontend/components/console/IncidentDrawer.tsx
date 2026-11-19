import React from 'react';
import { X } from 'lucide-react';
import { LogEntry } from '../../lib/types';

interface IncidentDrawerProps {
  selectedLog: LogEntry | null;
  onClose: () => void;
}

export default function IncidentDrawer({ selectedLog, onClose }: IncidentDrawerProps) {
  if (!selectedLog) return null;

  const severityColor = selectedLog.severity === 'Critical' ? 'red' : 
                       selectedLog.severity === 'Warning' ? 'amber' : 'blue';
  const severityPercent = selectedLog.severity === 'Critical' ? 94.2 : 
                          selectedLog.severity === 'Warning' ? 67.8 : 45.3;

  const timelineEvents = [
    { time: '14:32:01 UTC', event: 'Deviation detected', status: 'complete' },
    { time: '14:32:03 UTC', event: 'Confidence exceeded threshold', status: 'complete' },
    { time: '14:32:05 UTC', event: 'AI isolation recommendation generated', status: 'complete' },
    { time: '14:32:07 UTC', event: 'Automated containment active', status: 'current' },
  ];

  return (
    <div className="fixed inset-0 z-[9000] bg-black/20 backdrop-blur-3xl flex justify-end">
      <div className="w-full max-w-md h-full bg-white/[0.03] backdrop-blur-3xl border-l border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-white tracking-tight">Event Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-none">
          <div className="p-5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px]">
            <div className={`inline-flex px-3 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wider mb-4 ${
              selectedLog.severity === 'Critical' ? 'bg-red-500/10 text-red-400' : 
              selectedLog.severity === 'Warning' ? 'bg-amber-500/10 text-amber-400' : 
              'bg-white/10 text-white/60'
            }`}>
              {selectedLog.severity} EVENT
            </div>
            <h3 className="text-lg text-white font-medium leading-snug mb-2">{selectedLog.event}</h3>
            <p className="text-sm text-white/40 font-mono mt-4">{selectedLog.id} • {selectedLog.time}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pl-2">Severity Confidence</span>
            <div className="p-5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/60">Threat Level</span>
                <span className="text-sm font-semibold text-white">{severityPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${severityColor}-500 transition-all duration-500 shadow-[0_0_15px_currentColor]`}
                  style={{ width: `${severityPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pl-2">Incident Timeline</span>
            <div className="p-5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] space-y-3">
              {timelineEvents.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    item.status === 'current' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_currentColor]' : 
                    item.status === 'complete' ? 'bg-white/30' : 'bg-white/10'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-mono">{item.time}</span>
                      {item.status === 'current' && (
                        <span className="text-[8px] text-emerald-400 uppercase tracking-wider">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pl-2">System Diagnostics</span>
            <div className="p-5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] font-mono text-xs text-white/60 leading-relaxed">
              [SOURCE]: {selectedLog.source}<br/><br/>
              [PAYLOAD_DATA]:<br/>
              {selectedLog.details || "No extended payload data attached to this execution sequence."}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pl-2">Action Matrix</span>
            <button className={`w-full py-3 rounded-[16px] border text-sm font-medium transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
              selectedLog.severity === 'Critical' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}>
              Acknowledge & Resolve
            </button>
            <button className="w-full py-3 rounded-[16px] bg-transparent border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-medium transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              Isolate Subsystem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}