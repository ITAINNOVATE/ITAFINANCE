'use client';

import React from 'react';
import { 
  FileText, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RapportsPage() {
  return (
    <div className="space-y-8">
      {/* Filters Header */}
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={16} className="text-primary" />
            <span className="font-medium">Période:</span>
            <select className="bg-transparent text-white outline-none cursor-pointer">
              <option>Mars 2026</option>
              <option>Février 2026</option>
              <option>Année 2026</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-all border border-white/10">
            <Download size={16} /> Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
            <FileText size={16} /> PDF Complet
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex justify-between mb-4">
            <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest">Total Revenus</h4>
            <ArrowUpRight className="text-secondary" />
          </div>
          <h3 className="text-3xl font-extrabold text-white">15.400.000 <span className="text-xs">FCFA</span></h3>
          <p className="text-xs text-secondary mt-2 font-medium">+15.2% vs mois dernier</p>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-red-400/10 to-transparent">
          <div className="flex justify-between mb-4">
            <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest">Total Dépenses</h4>
            <ArrowDownRight className="text-red-400" />
          </div>
          <h3 className="text-3xl font-extrabold text-white">3.265.000 <span className="text-xs">FCFA</span></h3>
          <p className="text-xs text-red-400 mt-2 font-medium">+5.4% vs mois dernier</p>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-secondary/10 to-transparent">
          <div className="flex justify-between mb-4">
            <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest">Bénéfice Net</h4>
            <PieChartIcon className="text-secondary" />
          </div>
          <h3 className="text-3xl font-extrabold text-white">12.135.000 <span className="text-xs">FCFA</span></h3>
          <p className="text-xs text-secondary mt-2 font-medium">Marge de 78.8%</p>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white">Répartition par Catégorie</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-text-muted bg-white/5">
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold">Nb. Transactions</th>
                <th className="px-6 py-4 font-semibold text-right">Volume</th>
                <th className="px-6 py-4 font-semibold text-right">Part (%)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { cat: 'Recettes Projets', count: 12, volume: '14.200.000', part: 92.2, color: 'bg-primary' },
                { cat: 'Acomptes Clients', count: 4, volume: '1.200.000', part: 7.8, color: 'bg-secondary' },
                { cat: '--- charges ---', count: 0, volume: '---', part: 0, isHeader: true },
                { cat: 'Salaires', count: 1, volume: '450.000', part: 13.7, color: 'bg-red-400' },
                { cat: 'Investissements', count: 1, volume: '2.500.000', part: 76.5, color: 'bg-purple-400' },
                { cat: 'Charges Fixes', count: 2, volume: '370.000', part: 9.8, color: 'bg-orange-400' },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${row.isHeader ? 'bg-white/2' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {!row.isHeader && <span className={`w-2 h-2 rounded-full ${row.color}`}></span>}
                       <span className={row.isHeader ? 'text-[10px] uppercase tracking-widest text-text-muted font-bold' : 'font-medium'}>
                         {row.cat}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{row.isHeader ? '' : row.count}</td>
                  <td className="px-6 py-4 text-right font-bold text-white">{row.isHeader ? '' : `${row.volume} FCFA`}</td>
                  <td className="px-6 py-4 text-right">
                    {!row.isHeader && (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden hidden md:block">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.part}%` }}></div>
                        </div>
                        <span className="font-semibold text-xs">{row.part}%</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
