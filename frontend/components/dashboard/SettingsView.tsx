'use client';

import React, { useState } from 'react';
import { Monitor, Mail, MessageSquare, Smartphone, Zap, Layers } from 'lucide-react';

interface SettingsViewProps {
  activeVertical: string;
  glowColor: string;
}

interface ToggleSetting {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

export default function SettingsView({ activeVertical, glowColor }: SettingsViewProps) {
  const [monitoringSettings, setMonitoringSettings] = useState<ToggleSetting[]>([
    { id: 'live-telemetry', label: 'Live Telemetry Streaming', icon: Monitor, enabled: true },
    { id: 'anomaly-detection', label: 'Autonomous Anomaly Detection', icon: Zap, enabled: true }
  ]);

  const [alertSettings, setAlertSettings] = useState<ToggleSetting[]>([
    { id: 'email-notifications', label: 'Email Notifications', icon: Mail, enabled: true },
    { id: 'slack-integration', label: 'Slack Integration', icon: MessageSquare, enabled: false },
    { id: 'sms-critical', label: 'SMS Critical Alerts', icon: Smartphone, enabled: true }
  ]);

  const [motionEffects, setMotionEffects] = useState('Full');
  const [themeIntensity, setThemeIntensity] = useState('High');

  const toggleSetting = (section: 'monitoring' | 'alerts', id: string) => {
    if (section === 'monitoring') {
      setMonitoringSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      ));
    } else {
      setAlertSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      ));
    }
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
        enabled ? 'bg-white/20' : 'bg-white/5'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 ${
          enabled 
            ? 'translate-x-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
            : 'translate-x-0 bg-white/40'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Settings Header */}
      <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 border border-white/10 bg-white/[0.03] px-3 py-1.5 rounded-[12px]">
              Platform Configuration
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight text-white capitalize">{activeVertical} Settings</h2>
          <p className="text-sm text-white/50 font-light tracking-wide">Configure monitoring preferences, alert routing, and spatial environment.</p>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monitoring Preferences */}
        <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <h3 className="text-sm font-medium text-white tracking-tight mb-6 relative z-10">Monitoring Preferences</h3>
          <div className="space-y-4 relative z-10">
            {monitoringSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div key={setting.id} className="flex items-center justify-between p-3 rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[12px] ${setting.enabled ? 'bg-white/10' : 'bg-white/5'} transition-colors`}>
                      <Icon className={`w-4 h-4 ${setting.enabled ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <span className="text-xs text-white/80 font-medium">{setting.label}</span>
                  </div>
                  <ToggleSwitch 
                    enabled={setting.enabled} 
                    onToggle={() => toggleSetting('monitoring', setting.id)} 
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Alert Routing */}
        <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <h3 className="text-sm font-medium text-white tracking-tight mb-6 relative z-10">Alert Routing</h3>
          <div className="space-y-4 relative z-10">
            {alertSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <div key={setting.id} className="flex items-center justify-between p-3 rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-[12px] ${setting.enabled ? 'bg-white/10' : 'bg-white/5'} transition-colors`}>
                      <Icon className={`w-4 h-4 ${setting.enabled ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <span className="text-xs text-white/80 font-medium">{setting.label}</span>
                  </div>
                  <ToggleSwitch 
                    enabled={setting.enabled} 
                    onToggle={() => toggleSetting('alerts', setting.id)} 
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Spatial Environment */}
        <section className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <h3 className="text-sm font-medium text-white tracking-tight mb-6 relative z-10">Spatial Environment</h3>
          <div className="space-y-6 relative z-10">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/60 font-medium">Motion Effects</span>
              </div>
              <div className="flex gap-2">
                {['Reduced', 'Full'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setMotionEffects(option)}
                    className={`flex-1 py-2 rounded-[16px] text-[10px] font-medium transition-all ${
                      motionEffects === option 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'bg-white/5 text-white/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-white/40" />
                <span className="text-xs text-white/60 font-medium">Theme Intensity</span>
              </div>
              <div className="flex gap-2">
                {['Low', 'Medium', 'High'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setThemeIntensity(option)}
                    className={`flex-1 py-2 rounded-[16px] text-[10px] font-medium transition-all ${
                      themeIntensity === option 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'bg-white/5 text-white/40 hover:bg-white/[0.08]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}