'use client';

import React from 'react';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  MapPin, 
  Paperclip, 
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const mockDepenses = [
  { id: 1, label: 'Loyer Bureau Cotonou', category: 'Charges Fixes', amount: '250.000', date: '01 Mars 2026', ref: 'FACT-054', hasFile: true },
  { id: 2, label: 'Abonnement Internet VIP', category: 'Charges Fixes', amount: '120.000', date: '02 Mars 2026', ref: 'FACT-055', hasFile: true },
  { id: 3, label: 'Salaire Développeur Junior', category: 'Salaires', amount: '350.000', date: '05 Mars 2026', ref: 'PAY-MAR-01', hasFile: false },
  { id: 4, label: 'Achat MacBook Pro M3', category: 'Investissements', amount: '2.500.000', date: '10 Mars 2026', ref: 'DEV-001', hasFile: true },
  { id: 5, label: 'Impression Flyers Promo', category: 'Marketing', amount: '45.000', date: '15 Mars 2026', ref: 'COM-089', hasFile: true },
];

export default function ExpenseTable() {
  return (
    <div className="space-y-6">
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Mars', value: '3.265.000', color: 'border-red-400' },
          { label: 'Salaires', value: '450.000', color: 'border-blue-400' },
          { label: 'Investissements', value: '2.500.000', color: 'border-purple-400' },
          { label: 'Charges', value: '370.000', color: 'border-orange-400' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-4 border-b-2 ${stat.color}`}>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-white">{stat.value} <span className="text-[10px]">FCFA</span></p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/2">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher une dépense..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-400/20 w-full md:w-auto justify-center">
            <TrendingDown size={18} />
            Enregistrer une Dépense
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-text-muted bg-white/5">
                <th className="px-6 py-4 font-semibold">Libellé / Référence</th>
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold text-center">Date</th>
                <th className="px-6 py-4 font-semibold">Montant</th>
                <th className="px-6 py-4 font-semibold text-right">Pièce</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockDepenses.map((d, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={d.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-white">{d.label}</p>
                      <p className="text-xs text-text-muted font-mono">{d.ref}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Tag size={12} className="text-primary/50" /> {d.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-text-muted">{d.date}</td>
                  <td className="px-6 py-4 font-bold text-red-400">-{d.amount} FCFA</td>
                  <td className="px-6 py-4 text-right">
                    {d.hasFile ? (
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary transition-all inline-flex items-center gap-1">
                        <Paperclip size={14} />
                        <span className="text-[10px] font-bold">PDF</span>
                      </button>
                    ) : (
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-all text-xs border border-dashed border-white/10 italic">
                        Manquant
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
