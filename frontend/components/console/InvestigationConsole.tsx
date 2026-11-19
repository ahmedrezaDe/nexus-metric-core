import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Search, SearchCode } from 'lucide-react';
import { LogEntry, LogSeverity } from '../../lib/types';

interface InvestigationConsoleProps {
  logs: LogEntry[];
  searchQuery: string;
  logFilter: LogSeverity;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: LogSeverity) => void;
  onLogSelect: (log: LogEntry) => void;
  onExport: () => void;
}

export default function InvestigationConsole({
  logs,
  searchQuery,
  logFilter,
  onSearchChange,
  onFilterChange,
  onLogSelect,
  onExport
}: InvestigationConsoleProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs (JUMP FIX APPLIED)
  useEffect(() => {
    if (logsEndRef.current) {
      // We target the parent scrollable container instead of the whole window
      const scrollContainer = logsEndRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [logs]);

  const displayedLogs = logs.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = logFilter === 'All' || log.severity === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-[16px] bg-white/[0.03] border border-white/5">
            <Terminal className="h-4 w-4 text-white/70" />
          </div>
          <h3 className="text-base font-medium text-white tracking-tight">Investigation Console</h3>
        </div>
        <button onClick={onExport} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white" title="Export CSV/JSON">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4 shrink-0 relative z-10 px-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[20px] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {(['All', 'Critical', 'Warning', 'Info'] as LogSeverity[]).map(level => (
            <button 
              key={level} 
              onClick={() => onFilterChange(level)}
              className={`px-4 py-1.5 rounded-[16px] text-[10px] font-medium uppercase tracking-wider whitespace-nowrap transition-all ${logFilter === level ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10 rounded-[24px] border border-white/5 bg-white/[0.02]">
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {displayedLogs.length > 0 ? displayedLogs.map((log) => (
            <button 
              key={log.id} 
              onClick={() => onLogSelect(log)} 
              className={`w-full text-left bg-white/[0.03] backdrop-blur-3xl border p-4 rounded-[20px] flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                log.severity === 'Critical' 
                  ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                  : log.severity === 'Warning' 
                    ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                    : 'border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono w-full">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[8px] uppercase tracking-wider font-semibold ${
                  log.severity === 'Critical' 
                    ? 'bg-red-500/10 text-red-400' 
                    : log.severity === 'Warning' 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-white/10 text-white/50'
                }`}>
                  {log.severity}
                </span>
                <span className="text-white/30">{log.time}</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-light truncate w-full">{log.event}</p>
            </button>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
              <SearchCode className="w-6 h-6 mb-3 text-white/30" />
              <p className="text-xs text-white/50 font-medium">No events match criteria.</p>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}