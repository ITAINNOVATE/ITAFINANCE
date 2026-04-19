'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieChartIcon,
  Filter,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, PLATFORM_ID } from '../../lib/supabase';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  isWithinInterval, 
  parseISO, 
  startOfYear, 
  endOfYear 
} from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RapportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('current'); // 'current', 'last', 'year'
  const [data, setData] = useState({
    payments: [] as any[],
    expenses: [] as any[],
    prevPayments: [] as any[],
    prevExpenses: [] as any[]
  });

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let start, end, prevStart, prevEnd;

      if (period === 'current') {
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
      } else if (period === 'last') {
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        prevStart = startOfMonth(subMonths(now, 2));
        prevEnd = endOfMonth(subMonths(now, 2));
      } else {
        start = startOfYear(now);
        end = endOfYear(now);
        prevStart = startOfYear(subMonths(now, 12));
        prevEnd = endOfYear(subMonths(now, 12));
      }

      // Fetch all required data
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('platform_id', PLATFORM_ID);
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('status', 'paid')
        .eq('platform_id', PLATFORM_ID);

      const currentPayments = (payments || []).filter(p => isWithinInterval(parseISO(p.payment_date), { start, end }));
      const currentExpenses = (expenses || []).filter(e => e.payment_date && isWithinInterval(parseISO(e.payment_date), { start, end }));
      
      const prevPayments = (payments || []).filter(p => isWithinInterval(parseISO(p.payment_date), { start: prevStart, end: prevEnd }));
      const prevExpenses = (expenses || []).filter(e => e.payment_date && isWithinInterval(parseISO(e.payment_date), { start: prevStart, end: prevEnd }));

      setData({
        payments: currentPayments,
        expenses: currentExpenses,
        prevPayments,
        prevExpenses
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const rev = data.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const exp = data.expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const net = rev - exp;
    const margin = rev > 0 ? (net / rev) * 100 : 0;

    const prevRev = data.prevPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const prevExp = data.prevExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
    
    const revChange = prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0;
    const expChange = prevExp > 0 ? ((exp - prevExp) / prevExp) * 100 : 0;

    return { rev, exp, net, margin, revChange, expChange };
  }, [data]);

  const categories = useMemo(() => {
    const cats: Record<string, { count: number, volume: number, color: string }> = {};
    
    // Revenue categories (simulated from payment notes or generic)
    data.payments.forEach(p => {
      const cat = "Recettes Projets";
      if (!cats[cat]) cats[cat] = { count: 0, volume: 0, color: 'bg-primary' };
      cats[cat].count++;
      cats[cat].volume += Number(p.amount);
    });

    // Expense categories
    const colors = ['bg-red-400', 'bg-purple-400', 'bg-orange-400', 'bg-accent', 'bg-blue-400'];
    data.expenses.forEach((e, i) => {
      if (!cats[e.category]) cats[e.category] = { count: 0, volume: 0, color: colors[i % colors.length] };
      cats[e.category].count++;
      cats[e.category].volume += Number(e.amount);
    });

    return Object.entries(cats).map(([name, val]) => ({
      cat: name,
      ...val,
      part: stats.rev > 0 || stats.exp > 0 ? (val.volume / (stats.rev + stats.exp)) * 100 : 0
    })).sort((a, b) => b.volume - a.volume);
  }, [data, stats]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Filter size={16} className="text-primary" />
            <span className="font-medium">Période:</span>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer font-bold"
            >
              <option value="current" className="bg-[#0a0c10]">Mois en cours</option>
              <option value="last" className="bg-[#0a0c10]">Mois dernier</option>
              <option value="year" className="bg-[#0a0c10]">Année {new Date().getFullYear()}</option>
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
        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-transparent border-l-4 border-primary">
          <div className="flex justify-between mb-4">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Revenus</h4>
            <ArrowUpRight className="text-secondary" size={18} />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.rev.toLocaleString('fr-FR')} <span className="text-xs opacity-40">FCFA</span></h3>
          <p className={`text-[10px] mt-2 font-black uppercase tracking-wider ${stats.revChange >= 0 ? 'text-secondary' : 'text-red-400'}`}>
            {stats.revChange >= 0 ? '+' : ''}{stats.revChange.toFixed(1)}% vs période préc.
          </p>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-red-400/10 to-transparent border-l-4 border-red-400">
          <div className="flex justify-between mb-4">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Dépenses</h4>
            <ArrowDownRight className="text-red-400" size={18} />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.exp.toLocaleString('fr-FR')} <span className="text-xs opacity-40">FCFA</span></h3>
          <p className={`text-[10px] mt-2 font-black uppercase tracking-wider ${stats.expChange <= 0 ? 'text-secondary' : 'text-red-400'}`}>
            {stats.expChange >= 0 ? '+' : ''}{stats.expChange.toFixed(1)}% vs période préc.
          </p>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-secondary/10 to-transparent border-l-4 border-secondary">
          <div className="flex justify-between mb-4">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Bénéfice Net</h4>
            <PieChartIcon className="text-secondary" size={18} />
          </div>
          <h3 className="text-3xl font-black text-white">{stats.net.toLocaleString('fr-FR')} <span className="text-xs opacity-40">FCFA</span></h3>
          <p className="text-[10px] text-secondary mt-2 font-black uppercase tracking-wider">Marge de {stats.margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="glass-card overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Répartition des Flux</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-text-muted/60 bg-white/5">
                <th className="px-5 sm:px-8 py-5 font-black">Catégorie</th>
                <th className="px-5 sm:px-8 py-5 font-black">Transactions</th>
                <th className="px-5 sm:px-8 py-5 font-black text-right">Volume</th>
                <th className="px-5 sm:px-8 py-5 font-black text-right">Part relative</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-text-muted italic">Aucune donnée pour cette période</td>
                </tr>
              ) : (
                categories.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 sm:px-8 py-5">
                      <div className="flex items-center gap-3">
                         <span className={`w-2.5 h-2.5 rounded-full ${row.color} shadow-lg shadow-current/20`}></span>
                         <span className="font-bold text-white group-hover:text-primary transition-colors whitespace-nowrap">
                           {row.cat}
                         </span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-8 py-5 text-text-muted font-medium">{row.count}</td>
                    <td className="px-5 sm:px-8 py-5 text-right font-black text-white whitespace-nowrap">{row.volume.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-5 sm:px-8 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block border border-white/5">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.part}%` }}></div>
                        </div>
                        <span className="font-black text-[10px] text-white tracking-tighter w-8 text-right">{row.part.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
