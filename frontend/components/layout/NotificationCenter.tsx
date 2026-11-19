'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  time: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Critical deviation detected', time: '2 min ago', severity: 'critical', read: false },
    { id: '2', message: 'Threshold breach', time: '5 min ago', severity: 'warning', read: false },
    { id: '3', message: 'Subsystem isolated', time: '7 min ago', severity: 'info', read: false }
  ]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <CheckCircle className="w-4 h-4 text-white/40" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/20 bg-red-500/5';
      case 'warning': return 'border-amber-500/20 bg-amber-500/5';
      case 'info': return 'border-emerald-500/20 bg-emerald-500/5';
      default: return 'border-white/5 bg-white/[0.02]';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-[16px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all text-white/60 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white tracking-tight">Notifications</h3>
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-white/40 hover:text-white transition-colors font-medium"
            >
              Mark all as read
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-[20px] border transition-all hover:bg-white/[0.04] ${getSeverityColor(notification.severity)} ${!notification.read ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(notification.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 font-medium leading-snug">{notification.message}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/5 text-center">
            <button className="text-[10px] text-white/40 hover:text-white transition-colors font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}