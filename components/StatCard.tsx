'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent';
}

export default function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const glowMap: Record<string, string> = {
    primary: "glow-primary border-primary/20",
    secondary: "glow-secondary border-secondary/20",
    accent: "glow-accent border-accent/20",
  };

  const iconColorMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`glass-card border-l-4 ${glowMap[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconColorMap[color]}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${trend.positive ? "text-secondary bg-secondary/10" : "text-red-400 bg-red-400/10"}`}>
            {trend.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="text-text-muted text-xs font-bold uppercase tracking-widest">{title}</span>
        <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
}
