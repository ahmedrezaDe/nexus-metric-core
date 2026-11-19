'use client';

import React, { useState } from 'react';
import { FileText, ShieldAlert, History, CheckCircle, Download, Loader2 } from 'lucide-react';

interface ReportsViewProps {
  activeVertical: string;
  glowColor: string;
}

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'idle' | 'generating' | 'ready';
}

export default function ReportsView({ activeVertical, glowColor }: ReportsViewProps) {
  const [reports, setReports] = useState<ReportCard[]>([
    { title: 'Operational Summary', description: 'System performance overview', icon: FileText, status: 'idle' },
    { title: 'Risk Assessment', description: 'Threat analysis and mitigation', icon: ShieldAlert, status: 'idle' },
    { title: 'Incident History', description: 'Timeline of system events', icon: History, status: 'idle' },
    { title: 'Compliance Audit', description: 'Regulatory status check', icon: CheckCircle, status: 'idle' }
  ]);

  const handleGenerateReport = (index: number) => {
    setReports(prev => {
      const updated = [...prev];
      updated[index].status = 'generating';
      return updated;
    });

    setTimeout(() => {
      setReports(prev => {
        const updated = [...prev];
        updated[index].status = 'ready';
        return updated;
      });
    }, 2000);
  };

  const recentArchives = [
    { name: 'Q2 Operational Summary', timestamp: '2026-07-15 14:32 UTC', status: 'Verified' },
    { name: 'Risk Assessment v2.1', timestamp: '2026-07-14 09:15 UTC', status: 'Verified' },
    { name: 'Incident History Report', timestamp: '2026-07-13 16:45 UTC', status: 'Verified' },
    { name: 'Compliance Audit Final', timestamp: '2026-07-12 11:20 UTC', status: 'Verified' }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Reports Header */}
      <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 border border-white/10 bg-white/[0.03] px-3 py-1.5 rounded-[12px]">
              Report Generation
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight text-white capitalize">{activeVertical} Reports</h2>
          <p className="text-sm text-white/50 font-light tracking-wide">Generate comprehensive enterprise documentation and compliance records.</p>
        </div>
      </section>

      {/* Report Types Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-6 rounded-[32px] flex flex-col justify-between relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5">
                  <Icon className="w-5 h-5 text-white/70" />
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  report.status === 'generating' ? 'bg-amber-500 animate-pulse' : 
                  report.status === 'ready' ? 'bg-emerald-500' : 
                  'bg-white/20'
                }`} />
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium text-white tracking-tight">{report.title}</h3>
                <p className="text-xs text-white/40 font-light">{report.description}</p>
              </div>

              <button
                onClick={() => handleGenerateReport(index)}
                disabled={report.status === 'generating'}
                className={`w-full py-3 rounded-[16px] border text-sm font-medium transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
                  report.status === 'generating' 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-not-allowed' 
                    : report.status === 'ready' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {report.status === 'generating' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Data...
                  </span>
                ) : report.status === 'ready' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Ready
                  </span>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          );
        })}
      </section>

      {/* Recent Archives */}
      <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        
        <h3 className="text-lg font-medium text-white tracking-tight mb-6 relative z-10">Recent Archives</h3>
        
        <div className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-white/40 pb-4">Document Name</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-white/40 pb-4">Generated Timestamp</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-white/40 pb-4">Status</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-white/40 pb-4">Download</th>
                </tr>
              </thead>
              <tbody>
                {recentArchives.map((archive, index) => (
                  <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-sm text-white/80 font-medium">{archive.name}</td>
                    <td className="py-4 text-xs text-white/40 font-mono">{archive.timestamp}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-[8px] text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                        {archive.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}