'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  ArrowUpRight,
  Plus,
  Loader2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { RevenueChart, ExpenseDistribution } from '../components/Charts';
import { motion } from 'framer-motion';
import { supabase, PLATFORM_ID } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    activeProjects: 0,
    incomeTrend: "+0%",
    expenseTrend: "+0%"
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const sixMonthsAgo = startOfMonth(subMonths(now, 5));

      // 1. Fetch Payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('platform_id', PLATFORM_ID)
        .gte('payment_date', sixMonthsAgo.toISOString());

      // 2. Fetch Expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('platform_id', PLATFORM_ID)
        .or(`planned_date.gte.${sixMonthsAgo.toISOString()},payment_date.gte.${sixMonthsAgo.toISOString()}`);

      // 3. Fetch Projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*, clients(name)')
        .eq('platform_id', PLATFORM_ID)
        .order('created_at', { ascending: false });

      // Calculate Stats
      const totalIncome = (payments || []).reduce((acc, p) => acc + Number(p.amount), 0);
      const totalPaidExpenses = (expenses || [])
        .filter(e => e.status === 'paid')
        .reduce((acc, e) => acc + Number(e.amount), 0);
      
      const thisMonthIncome = (payments || [])
        .filter(p => isWithinInterval(parseISO(p.payment_date), { start: monthStart, end: monthEnd }))
        .reduce((acc, p) => acc + Number(p.amount), 0);

      const thisMonthExpenses = (expenses || [])
        .filter(e => e.status === 'paid' && e.payment_date && isWithinInterval(parseISO(e.payment_date), { start: monthStart, end: monthEnd }))
        .reduce((acc, e) => acc + Number(e.amount), 0);

      const activeProjectsCount = (projects || []).filter(p => p.status === 'En cours').length;

      setStats({
        balance: totalIncome - totalPaidExpenses,
        monthlyIncome: thisMonthIncome,
        monthlyExpenses: thisMonthExpenses,
        activeProjects: activeProjectsCount,
        incomeTrend: "+0%", // Simplifié car on n'a pas forcément le mois dernier en base
        expenseTrend: "+0%"
      });

      // Recent Projects (Last 3)
      setRecentProjects((projects || []).slice(0, 3).map(p => ({
        name: p.name,
        client: p.clients?.name || 'Client Inconnu',
        status: p.status,
        statusColor: p.status === 'Terminé' ? 'text-secondary bg-secondary/10' : p.status === 'Suspendu' ? 'text-accent bg-accent/10' : 'text-primary bg-primary/10',
        budget: Number(p.total_budget || 0).toLocaleString('fr-FR')
      })));

      // Upcoming Deadlines (Next 3 pending expenses)
      const pending = (expenses || [])
        .filter(e => e.status === 'pending')
        .sort((a, b) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime())
        .slice(0, 3)
        .map(e => ({
          title: e.label,
          date: format(parseISO(e.planned_date), 'dd MMMM yyyy', { locale: fr }),
          amount: Number(e.amount).toLocaleString('fr-FR') + ' FCFA',
          priority: new Date(e.planned_date) < now ? 'high' : 'medium'
        }));
      setUpcomingDeadlines(pending);

      // Chart Data (Last 6 months)
      const mData = [];
      for (let i = 5; i >= 0; i--) {
        const m = subMonths(now, i);
        const mStr = format(m, 'MMM', { locale: fr });
        const start = startOfMonth(m);
        const end = endOfMonth(m);

        const inc = (payments || [])
          .filter(p => isWithinInterval(parseISO(p.payment_date), { start, end }))
          .reduce((acc, p) => acc + Number(p.amount), 0);
        
        const exp = (expenses || [])
          .filter(e => e.status === 'paid' && e.payment_date && isWithinInterval(parseISO(e.payment_date), { start, end }))
          .reduce((acc, e) => acc + Number(e.amount), 0);

        mData.push({ name: mStr, income: inc, expenses: exp });
      }
      setChartData(mData);

      // Distribution Data (This month by category)
      const cats: Record<string, number> = {};
      (expenses || [])
        .filter(e => e.status === 'paid' && e.payment_date && isWithinInterval(parseISO(e.payment_date), { start: monthStart, end: monthEnd }))
        .forEach(e => {
          cats[e.category] = (cats[e.category] || 0) + Number(e.amount);
        });
      
      const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      setDistribution(Object.entries(cats).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      })));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Solde Actuel" 
          value={`${stats.balance.toLocaleString('fr-FR')} FCFA`} 
          icon={Wallet} 
          color="primary"
        />
        <StatCard 
          title="Entrées" 
          value={`${stats.monthlyIncome.toLocaleString('fr-FR')} FCFA`} 
          icon={TrendingUp} 
          trend={{ value: stats.incomeTrend, positive: true }}
          color="secondary"
        />
        <StatCard 
          title="Dépenses" 
          value={`${stats.monthlyExpenses.toLocaleString('fr-FR')} FCFA`} 
          icon={TrendingDown} 
          trend={{ value: stats.expenseTrend, positive: false }}
          color="accent"
        />
        <StatCard 
          title="Projets Actifs" 
          value={stats.activeProjects.toString()} 
          icon={Briefcase} 
          color="primary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 glass-card p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Évolution de la Trésorerie</h3>
              <p className="text-[10px] sm:text-sm text-text-muted">Revenus vs Dépenses (6 mois)</p>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="glass-card p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white mb-1">Dépenses par catégorie</h3>
          <p className="text-[10px] sm:text-sm text-text-muted mb-6">Ce mois-ci</p>
          <ExpenseDistribution data={distribution} />
        </div>
      </div>

      {/* Bottom Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-12">
        {/* Recent Projects */}
        <div className="glass-card overflow-hidden h-fit">
          <div className="flex justify-between items-center px-5 sm:px-6 py-5 sm:py-6">
            <h3 className="text-lg font-bold text-white">Projets Récents</h3>
            <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Mobile Cards for Projects */}
          <div className="px-5 pb-5 space-y-3 sm:hidden">
            {recentProjects.length === 0 ? (
              <p className="text-center py-4 text-text-muted italic text-sm">Aucun projet</p>
            ) : (
              recentProjects.map((project, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white leading-snug">{project.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Client</span>
                      <span className="text-[11px] font-bold text-white">{project.client}</span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Budget</span>
                      <span className="text-[11px] font-black text-secondary">{project.budget} FCFA</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-text-muted bg-white/[0.02]">
                  <th className="px-6 py-4 font-bold">Projet</th>
                  <th className="px-6 py-4 font-bold">Client</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right pr-8">Budget</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-text-muted italic">Aucun projet enregistré</td>
                  </tr>
                ) : (
                  recentProjects.map((project, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4 font-bold text-white group-hover:text-primary transition-colors">{project.name}</td>
                      <td className="px-6 py-4 text-text-muted font-medium">{project.client}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${project.statusColor}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-white text-right pr-8">{project.budget} FCFA</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Échéances Proches</h3>
            <button className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-center py-10 text-text-muted italic text-sm">Aucune échéance à venir</p>
            ) : (
              upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group cursor-pointer shadow-lg hover:shadow-primary/5">
                  <div className={`w-1.5 h-12 rounded-full shadow-lg ${item.priority === 'high' ? 'bg-red-500 glow-red' : item.priority === 'medium' ? 'bg-orange-500 glow-orange' : 'bg-primary glow-primary'}`}></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white tracking-tight">{item.amount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
