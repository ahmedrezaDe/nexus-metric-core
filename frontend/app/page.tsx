'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Activity, ArrowRight, Command, Menu, BarChart3, Search, X, Clock
} from 'lucide-react';
import {
  MetricPoint,
  AnomalyInsight,
  VerticalType,
  TimeRange,
  LogSeverity,
  LogEntry,
  KPIMetric
} from '../lib/types';
import { verticalConfigs } from '../lib/verticalConfig';
import GlobalStatusBar from '../components/layout/GlobalStatusBar';
import MetricCard from '../components/dashboard/MetricCard';
import InvestigationConsole from '../components/console/InvestigationConsole';
import IncidentDrawer from '../components/console/IncidentDrawer';
import AnalyticsView from '../components/dashboard/AnalyticsView';
import ReportsView from '../components/dashboard/ReportsView';
import SettingsView from '../components/dashboard/SettingsView';
import NotificationCenter from '../components/layout/NotificationCenter';
import SystemStatusWidget from '../components/layout/SystemStatusWidget';

// --- Main Application ---
export default function DashboardHome() {
  const [activeVertical, setActiveVertical] = useState<VerticalType>('home');
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('LIVE');
  const [logFilter, setLogFilter] = useState<LogSeverity>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Global States
  const [currentTime, setCurrentTime] = useState<string>('');
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [liveEvents, setLiveEvents] = useState<LogEntry[]>([]);
  const [eventsPerMin, setEventsPerMin] = useState(3492);

  // Core Telemetry State
  const [streamCache, setStreamCache] = useState<Record<string, MetricPoint[]>>({
    fintech: [], industrial: [], cyber: [], enterprise_erp: []
  });
  const [insights, setInsights] = useState<AnomalyInsight[]>([]);
  const [currentVal1, setCurrentVal1] = useState<number>(0);
  const [currentVal2, setCurrentVal2] = useState<number>(0);
  const [systemState, setSystemState] = useState<'syncing' | 'nominal' | 'alert'>('syncing');
  const [autoScroll, setAutoScroll] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const targetVertical = activeVertical === 'enterprise' ? 'enterprise_erp' : activeVertical;
  const streamData = activeVertical !== 'home' ? (streamCache[targetVertical] || []) : [];
  const verticalConfig = verticalConfigs[activeVertical];

  const minVal = streamData.length > 0 ? Math.min(...streamData.map(d => d.price)) * 0.95 : 0;
  const maxVal = streamData.length > 0 ? Math.max(...streamData.map(d => d.price)) * 1.05 : 200;

  const generateDigitalPath = (data: MetricPoint[] = streamData) => {
    if (data.length < 2) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * 100} ${100 - ((d.price - minVal) / (Math.max(maxVal - minVal, 1))) * 100}`).join(' ');
  };

  // --- Clock & Event Generators ---
  useEffect(() => {
    const timeInterval = setInterval(() => setCurrentTime(new Date().toISOString().substring(11, 19) + ' UTC'), 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (activeVertical === 'home') return;
    const logInterval = setInterval(() => {
      setEventsPerMin(prev => prev + Math.floor(Math.random() * 5) - 2);
      
      const evtList = verticalConfig.events || ["System tick processed"];
      const randomEvent = evtList[Math.floor(Math.random() * evtList.length)];
      
      const newLog: LogEntry = {
        id: `evt-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        severity: Math.random() > 0.85 ? 'Warning' : 'Info',
        source: verticalConfig.entity || 'SYSTEM',
        event: randomEvent,
        details: `Automated system telemetry check complete. Vector normalized.`
      };
      setLiveEvents(prev => [newLog, ...prev].slice(0, 100));
    }, 3500);
    return () => clearInterval(logInterval);
  }, [activeVertical, verticalConfig.events, verticalConfig.entity]);

  // Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCmdPaletteOpen(false);
        setSelectedLog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Main Telemetry WebSocket (Mock) ---
  useEffect(() => {
    let isMounted = true;
    let socket: WebSocket | null = null;
    
    if (activeVertical === 'home') return;

    // We simulate the DB/WS connection seamlessly for immediate rendering
    const generatePoint = () => {
      const base = activeVertical === 'fintech' ? 150 : activeVertical === 'cyber' ? 40 : 100;
      return {
        price: base + Math.sin(Date.now() / 1000) * 20 + (Math.random() * 10),
        volume: 20 + Math.random() * 50,
        isAnomaly: Math.random() > 0.95,
        timestamp: Date.now()
      };
    };

    // Hydrate initial data immediately
    const initialData = Array.from({length: 40}).map((_, i) => ({
      ...generatePoint(),
      timestamp: Date.now() - (40 - i) * 2000
    }));
    setStreamCache(prev => ({ ...prev, [targetVertical]: initialData }));

    // Stream live ticks
    const interval = setInterval(() => {
      if (!isMounted) return;
      const pt = generatePoint();
      
      setStreamCache((prevCache) => {
        const currentList = prevCache[targetVertical] || [];
        return { ...prevCache, [targetVertical]: [...currentList, pt].slice(-40) };
      });
      
      setCurrentVal1(pt.price);
      setCurrentVal2(pt.volume);
      
      if (pt.isAnomaly) {
        setSystemState('alert');
        const newInsight: AnomalyInsight = {
          anomaly_id: Date.now(),
          score: parseFloat((1.5 + Math.random()).toFixed(2)),
          technical_specs: `Vector Deviation @ ${pt.price.toFixed(2)}`,
          timestamp: new Date().toISOString(),
          ai_executive_summary: `Critical deviation detected on ${activeVertical} node. Automatic isolation procedures recommended.`
        };
        setInsights(prev => [newInsight, ...prev].slice(0, 20));
        setLiveEvents(prev => [{
          id: `crit-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          severity: 'Critical' as LogSeverity, // Fixed Type
          source: 'AI OVERWATCH',
          event: newInsight.ai_executive_summary,
          details: newInsight.technical_specs
        }, ...prev].slice(0, 100));
      } else {
        setSystemState('nominal');
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeVertical, targetVertical]);

  // --- Export Function ---
  const exportForensicManifest = useCallback(() => {
    if (insights.length === 0 && liveEvents.length === 0) {
      alert("No forensic logs available for export.");
      return;
    }
    
    const exportData = {
      vertical: activeVertical,
      exportTimestamp: new Date().toISOString(),
      insights,
      liveEvents
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nexus_export_${activeVertical}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [activeVertical, insights, liveEvents]);


  const launchWorkspaceSequence = (vertical: VerticalType) => {
    setIsLaunching(true);
    setTimeout(() => setActiveVertical(vertical), 400);
    setTimeout(() => setIsLaunching(false), 1200);
  };

  // --- Render Functions ---

  if (activeVertical === 'home') {
    return (
      <div className="min-h-screen bg-[#030406] flex items-center justify-center p-6 relative overflow-hidden font-sans antialiased text-white">
        {/* Spatial Backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-[#00E5A8]/10 blur-[200px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-[#18A8FF]/10 blur-[200px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="relative z-10 w-full max-w-[1400px]">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              Nexus Metric Core
            </h1>
            <p className="text-base text-white/50 tracking-wide font-light max-w-2xl mx-auto">
              Select a Spatial Isolation Pipeline to Initialize Enterprise Telemetry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: 'fintech', title: 'Quantitative Capital', desc: 'AI Stock Trading Terminal. Monitors high-frequency order-book depth and renders real-time candlestick volatility matrices.', color: 'bg-[#00E5A8]', shadow: 'shadow-[#00E5A8]' },
              { id: 'industrial', title: 'SCADA Infrastructure', desc: 'Predictive kinematic forensics. Cross-analyzes fluid hydraulic head-loss and torsional bearing fatigue frequencies.', color: 'bg-[#FFA000]', shadow: 'shadow-[#FFA000]' },
              { id: 'cyber', title: 'Distributed Forensics', desc: 'Zero-trust packet edge hub. Maps asynchronous packet fragmentation skews against volumetric external ingress spikes.', color: 'bg-[#6C63FF]', shadow: 'shadow-[#6C63FF]' },
              { id: 'enterprise', title: 'Enterprise ERP Ledger', desc: 'Financial liability tracking. Parses nested corporate accounting payloads to isolate anomalous net capital impacts.', color: 'bg-[#18A8FF]', shadow: 'shadow-[#18A8FF]' }
            ].map((mod) => (
              <button key={mod.id} onClick={() => launchWorkspaceSequence(mod.id as VerticalType)} 
                className={`group relative text-left bg-white/[0.03] backdrop-blur-3xl border border-white/10 hover:border-white/30 rounded-[40px] p-10 transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:scale-[1.02] shadow-[0_20px_60px_rgba(0,0,0,0.3)]`}>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
                <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`h-4 w-4 rounded-full ${mod.color} shadow-[0_0_20px_var(--tw-shadow-color)]`} style={{ '--tw-shadow-color': mod.color.replace('bg-[', '').replace(']', '') } as any} />
                    <ArrowRight className="text-white/20 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-medium text-white mb-3 tracking-tight">{mod.title}</h2>
                    <p className="text-sm text-white/40 leading-relaxed font-light">{mod.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Filtered Logs ---
  const displayedLogs = liveEvents.filter(log => {
    const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) || log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = logFilter === 'All' || log.severity === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* 🚀 Workspace Loader */}
      {isLaunching && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020203]/80 backdrop-blur-3xl text-white font-sans antialiased">
          <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-center relative overflow-hidden transition-all scale-100">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
            <div className="relative w-16 h-16 mx-auto mb-8">
              <div className={`absolute inset-0 border-2 border-t-transparent rounded-full animate-spin`} style={{ borderRightColor: verticalConfig.stroke, borderBottomColor: verticalConfig.stroke, borderLeftColor: verticalConfig.stroke }} />
              <div className={`absolute inset-3 rounded-full ${verticalConfig.glow} opacity-20 animate-pulse`} />
            </div>
            <h2 className="text-3xl font-medium tracking-tight mb-3">Initializing Workspace</h2>
            <p className="text-base text-white/40 font-light">Establishing Spatial Telemetry Core...</p>
          </div>
        </div>
      )}

      {/* ⌘K Command Palette */}
      {cmdPaletteOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
          <div className="w-full max-w-2xl bg-[#090A0F]/90 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-white/40 mr-3" />
              <input autoFocus type="text" placeholder="Search commands, domains, or logs..." className="flex-1 bg-transparent border-none text-white text-lg placeholder:text-white/30 focus:outline-none" />
              <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono"><kbd className="px-2 py-1 bg-white/5 rounded">ESC</kbd> to close</div>
            </div>
            <div className="p-2">
              <div className="px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Quick Actions</div>
              {['Return to Hub', 'Export CSV Data', 'Toggle Theme Mode', 'Acknowledge Alerts'].map((cmd, i) => (
                <button key={i} onClick={() => setCmdPaletteOpen(false)} className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-[12px] flex items-center justify-between group transition-colors">
                  {cmd} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-white/40 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📝 Incident Drawer */}
      <IncidentDrawer 
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Main UI Layout */}
      <div className="min-h-screen bg-[#020203] text-white flex flex-col font-sans antialiased relative overflow-x-hidden">
        
        {/* Ambient Background Glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className={`absolute top-[-15%] left-[-10%] w-[60%] h-[70%] ${verticalConfig.glow} opacity-[0.05] blur-[250px] rounded-full mix-blend-screen`} />
          <div className={`absolute bottom-[-15%] right-[-10%] w-[50%] h-[60%] ${verticalConfig.glow} opacity-[0.03] blur-[250px] rounded-full mix-blend-screen`} />
        </div>

        {/* Floating Top Navigation */}
        <header className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[1800px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] px-4 py-3 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          
          <div className="flex items-center gap-4 relative z-10 w-full justify-between md:justify-start">
            <button onClick={() => { setSystemState('syncing'); setActiveVertical('home'); }} className="px-4 py-2.5 rounded-[24px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-sm font-medium text-white/70 hover:text-white flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <div className="w-2 h-2 rounded-full bg-white/60" />
              </div>
              <span className="hidden md:block">Hub</span>
            </button>

            <div className="hidden md:block h-6 w-px bg-white/10 mx-2" />

            {/* Desktop Center Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] p-1 rounded-[24px] border border-white/5 relative">
              {['Dashboard', 'Analytics', 'Reports', 'Settings'].map((item) => (
                <button key={item} onClick={() => setActiveNav(item)} className={`relative px-5 py-2 rounded-[20px] text-sm font-medium transition-colors duration-300 z-10 ${activeNav === item ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>
                  {activeNav === item && <div className="absolute inset-0 bg-white/10 rounded-[20px] -z-10 shadow-sm" />}
                  {item}
                </button>
              ))}
            </nav>

            {/* Mobile Nav Toggle */}
            <button className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-white/60">
               <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 relative z-10">
            <div className="text-xs font-mono text-white/40 px-4 py-2 bg-black/20 rounded-[20px] border border-white/5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> {currentTime}
            </div>
            <div className="px-4 py-2.5 rounded-[24px] bg-white/[0.02] border border-white/10 flex items-center gap-3">
              <span className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Domain</span>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${verticalConfig.glow} shadow-[0_0_12px_currentColor] animate-pulse`} />
                <span className="text-sm font-medium capitalize text-white/90">{activeVertical}</span>
              </div>
            </div>
            <NotificationCenter />
          </div>
        </header>

        {/* Global Status Strip */}
        <GlobalStatusBar eventsPerMin={eventsPerMin} currentTime={currentTime} />

        {/* Workspace Content */}
        <div className="pt-32 md:pt-40 pb-10 px-4 md:px-8 xl:px-10 space-y-6 flex-1 max-w-[1800px] w-full mx-auto relative z-10 pb-24">
          
          {activeNav === 'Dashboard' && (
            <>
              {/* Hero Command Center Panel */}
              <section className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                
                <div className="space-y-3 z-10 max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 border border-white/10 bg-white/[0.03] px-3 py-1.5 rounded-[12px]">Telemetry Core Active</span>
                  </div>
                  <h2 className="text-4xl font-medium tracking-tight text-white">{verticalConfig.title}</h2>
                  <p className="text-sm text-white/50 font-light tracking-wide">{verticalConfig.tagline}</p>
                </div>

                {/* Information Pills */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10 w-full xl:w-auto">
                   {verticalConfig.heroPills.map((pill, idx) => (
                     <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-[20px] p-4 min-w-[140px]">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium block mb-1">{pill.label}</span>
                        <span className="text-sm font-semibold text-white/90">{pill.value}</span>
                     </div>
                   ))}
                </div>
              </section>

              {/* Metric Cards Grid */}
              <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {verticalConfig.kpis.map((kpi, i) => {
                  const val = kpi.derive(currentVal1, currentVal2);
                  const histArray = streamData.slice(-15).map(d => kpi.derive(d.price, d.volume));
                  const prevVal = histArray.length > 2 ? histArray[histArray.length - 2] : val;
                  const delta = prevVal ? ((val - prevVal) / prevVal) * 100 : 0;

                  return (
                    <MetricCard
                      key={i}
                      label={kpi.label}
                      value={val}
                      unit={kpi.unit}
                      isCurrency={kpi.isCurrency}
                      delta={delta}
                      sparklineData={histArray}
                      strokeColor={verticalConfig.stroke}
                    />
                  );
                })}
              </section>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start h-[600px]">
                
                {/* Visual Centerpiece Chart Panel */}
                <div className="xl:col-span-2 h-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

                  {/* Chart Toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 mb-8 gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white tracking-tight">System Visualization</h3>
                      <div className="text-xs text-white/40 mt-1 font-light flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${verticalConfig.glow} animate-pulse`} /> Live Vector Stream</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-[20px] p-1">
                        {(['1H', '24H', '7D', '30D', 'LIVE'] as TimeRange[]).map(range => (
                          <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-1.5 rounded-[16px] text-[10px] font-medium uppercase tracking-wider transition-all ${timeRange === range ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Area */}
                  <div className="w-full relative flex-1 flex flex-col justify-end">
                {streamData.length > 1 ? (
                  <div className="w-full h-full relative z-10 group"
                       onMouseLeave={() => setHoverIndex(null)}
                       onMouseMove={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const x = e.clientX - rect.left;
                         const percentage = Math.max(0, Math.min(1, x / rect.width));
                         const idx = Math.round(percentage * (streamData.length - 1));
                         setHoverIndex(idx);
                       }}
                  >
                    {/* Y-Axis Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 z-0 py-4">
                      {[...Array(5)].map((_, i) => <div key={i} className="border-b border-white/20 w-full h-px" />)}
                    </div>

                    <svg className="w-full h-[300px] overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {activeVertical === 'fintech' ? (
                        /* AI CANDLESTICK TRADING TERMINAL */
                        streamData.map((d, index) => {
                          const x = (index / (streamData.length - 1)) * 100;
                          const openPrice = index > 0 ? streamData[index - 1].price : d.price;
                          const closePrice = d.price;
                          const pseudoVolatility = (d.volume % 15) + 2;
                          const highPrice = Math.max(openPrice, closePrice) + pseudoVolatility;
                          const lowPrice = Math.min(openPrice, closePrice) - pseudoVolatility;

                          const yOpen = 100 - ((openPrice - minVal) / (Math.max(maxVal - minVal, 1))) * 100;
                          const yClose = 100 - ((closePrice - minVal) / (Math.max(maxVal - minVal, 1))) * 100;
                          const yHigh = 100 - ((highPrice - minVal) / (Math.max(maxVal - minVal, 1))) * 100;
                          const yLow = 100 - ((lowPrice - minVal) / (Math.max(maxVal - minVal, 1))) * 100;

                          const isBullish = closePrice >= openPrice;
                          const candleColor = d.isAnomaly ? "#ef4444" : (isBullish ? "#10b981" : "#f43f5e");
                          const candleWidth = 1.5;

                          return (
                            <g key={`candle-${index}`} className="transition-all duration-300">
                              <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="0.2" opacity="0.8" />
                              <rect x={x - (candleWidth / 2)} y={Math.min(yOpen, yClose)} width={candleWidth} height={Math.max(Math.abs(yOpen - yClose), 0.5)} fill={isBullish ? "transparent" : candleColor} stroke={candleColor} strokeWidth="0.2" />
                              {d.isAnomaly && <circle cx={x} cy={yClose} r="3" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.8" className="animate-ping" />}
                            </g>
                          );
                        })
                      ) : (
                        /* STANDARD OSCILLOSCOPE */
                        <>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={verticalConfig.stroke} stopOpacity="0.15" />
                              <stop offset="100%" stopColor={verticalConfig.stroke} stopOpacity="0.00" />
                            </linearGradient>
                          </defs>
                          <path d={`${generateDigitalPath()} L 100 100 L 0 100 Z`} fill="url(#areaGradient)" className="transition-all duration-300" />
                          <path d={generateDigitalPath()} fill="none" stroke={verticalConfig.stroke} strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" className="transition-all duration-300 drop-shadow-[0_0_8px_currentColor]" />
                          {streamData.map((d, index) => {
                            const x = (index / (streamData.length - 1)) * 100;
                            const y = 100 - ((d.price - minVal) / (Math.max(maxVal - minVal, 1))) * 100;
                            return (
                              <g key={`point-${index}`}>
                                {d.isAnomaly && (
                                  <>
                                    <circle cx={x} cy={y} r="1" fill="#ef4444" />
                                    <circle cx={x} cy={y} r="3" fill="none" stroke="#ef4444" strokeWidth="0.2" opacity="0.8" className="animate-ping" />
                                  </>
                                )}
                              </g>
                            );
                          })}
                        </>
                      )}
                    </svg>

                    {/* Interactive Crosshair & Tooltip Overlay */}
                    {hoverIndex !== null && streamData[hoverIndex] && (
                      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${(hoverIndex / (streamData.length - 1)) * 100}%` }}>
                        <div className="w-px h-full bg-white/20 border-l border-dashed border-white/30" />
                        <div className="absolute top-4 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-[16px] shadow-xl whitespace-nowrap z-50">
                          <p className="text-[10px] text-white/50 mb-1 font-mono">{new Date(streamData[hoverIndex].timestamp || Date.now()).toLocaleTimeString()}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-white/40 uppercase">SIGNAL VALUE</span>
                              <span className="text-sm font-semibold text-white font-mono">{streamData[hoverIndex].price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-[-6px] -translate-x-1/2 w-3 h-3 rounded-full bg-white/10 border-2 border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Activity className="h-8 w-8 text-white/20 animate-pulse mb-4" />
                    <p className="text-sm font-medium text-white/40">Aggregating Streams...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Investigation Console */}
            <InvestigationConsole
              logs={liveEvents}
              searchQuery={searchQuery}
              logFilter={logFilter}
              onSearchChange={setSearchQuery}
              onFilterChange={setLogFilter}
              onLogSelect={setSelectedLog}
              onExport={exportForensicManifest}
            />
          </div>
          </>
          )}

          {activeNav === 'Analytics' && (
            <AnalyticsView 
              activeVertical={activeVertical} 
              glowColor={verticalConfig.glow} 
            />
          )}

          {activeNav === 'Reports' && (
            <ReportsView 
              activeVertical={activeVertical} 
              glowColor={verticalConfig.glow} 
            />
          )}

          {activeNav === 'Settings' && (
            <SettingsView 
              activeVertical={activeVertical} 
              glowColor={verticalConfig.glow} 
            />
          )}
        </div>

        {/* System Status Widget */}
        <SystemStatusWidget glowColor={verticalConfig.glow} />
      </div>
    </>
  );
}