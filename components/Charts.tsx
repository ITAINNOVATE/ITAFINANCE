'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

interface RevenueData {
  name: string;
  income: number;
  expenses: number;
}

export function RevenueChart({ data = [] }: { data?: RevenueData[] }) {
  // Use mock data if empty for visual demo if needed, or just empty
  const displayData = data.length > 0 ? data : [
    { name: 'Jan', income: 0, expenses: 0 },
    { name: 'Fév', income: 0, expenses: 0 },
    { name: 'Mar', income: 0, expenses: 0 },
    { name: 'Avr', income: 0, expenses: 0 },
    { name: 'Mai', income: 0, expenses: 0 },
    { name: 'Juin', income: 0, expenses: 0 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#2563eb" 
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            strokeWidth={3}
            name="Entrées"
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            strokeWidth={2}
            name="Sorties"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

export function ExpenseDistribution({ data = [] }: { data?: DistributionData[] }) {
  const displayData = data.length > 0 ? data : [
    { name: 'Aucune donnée', value: 100, color: 'rgba(255,255,255,0.05)' }
  ];

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            width={80}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px'
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
