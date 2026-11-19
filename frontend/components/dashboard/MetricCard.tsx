import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  isCurrency: boolean;
  delta: number;
  sparklineData: number[];
  strokeColor: string;
}

export default function MetricCard({ 
  label, 
  value, 
  unit, 
  isCurrency, 
  delta, 
  sparklineData, 
  strokeColor 
}: MetricCardProps) {
  const isPositive = delta >= 0;
  
  const formatValue = (val: number) => {
    let formatted = val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (val >= 1000000) formatted = (val / 1000000).toFixed(2) + 'M';
    else if (val >= 10000 && isCurrency) formatted = (val / 1000).toFixed(1) + 'k';
    return `${isCurrency ? '$' : ''}${formatted}${unit}`;
  };

  const generateSparklinePath = () => {
    if (sparklineData.length < 2) return '';
    const sMin = Math.min(...sparklineData);
    const sMax = Math.max(...sparklineData);
    return sparklineData.map((v, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 100;
      const y = 30 - ((v - sMin) / (Math.max(sMax - sMin, 1))) * 30;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <motion.div
      className="group bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 rounded-[32px] flex flex-col justify-between relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[11px] font-medium tracking-wide text-white/50">{label}</span>
        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-[8px] ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>

      <span className="text-2xl font-light text-white tracking-tight flex items-baseline relative z-10 font-mono mb-4">
        {formatValue(value)}
      </span>

      <div className="h-[30px] w-full relative z-10 mt-auto opacity-50 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d={generateSparklinePath()} 
            fill="none" 
            stroke={isPositive ? "#10b981" : "#ef4444"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>
    </motion.div>
  );
}