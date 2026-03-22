'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  ChevronRight,
  Bell,
  Loader2,
  TrendingUp,
  Wallet,
  ArrowRight,
  History,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Schedule {
  id: string;
  project_id: string;
  due_date: string;
  amount: number;
  status: 'Payé' | 'En attente' | 'En retard';
}

interface Payment {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
}

interface Project {
  id: string;
  name: string;
  total_budget: number;
  status: string;
  clients: { name: string } | null;
  schedules: Schedule[];
  payments: Payment[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Project Card Component ───────────────────────────────────────────────────
function ProjectScheduleCard({ project }: { project: Project }) {
  const totalPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = project.total_budget - totalPaid;
  const progress = Math.min(100, (totalPaid / project.total_budget) * 100);
  
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="glass-card p-0 overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.03] transition-all group"
    >
      {/* Header section */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <TrendingUp size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors">{project.name}</h3>
            <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              {project.clients?.name || 'Client inconnu'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Budget Total</p>
            <p className="text-sm font-black text-white">{formatCFA(project.total_budget)}</p>
          </div>
          <div className="h-10 w-[1px] bg-white/5 hidden sm:block" />
          <div className="text-right">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Déjà Payé</p>
            <p className="text-sm font-black text-secondary">{formatCFA(totalPaid)}</p>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all ${isExpanded ? 'rotate-90' : ''}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-6">
        <div className="flex justify-between items-end mb-2">
           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Progression des règlements</span>
           <span className="text-xs font-black text-secondary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/20"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Schedules */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-primary" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Échéancier Prévisionnel</h4>
                </div>
                
                {project.schedules.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-4 bg-white/[0.02] rounded-xl text-center">Aucun échéancier programmé</p>
                ) : (
                  <div className="space-y-2">
                    {project.schedules.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${s.status === 'Payé' ? 'bg-secondary' : 'bg-amber-400 animate-pulse'}`} />
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{formatDate(s.due_date)}</p>
                            <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">{s.status}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-white">{formatCFA(s.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Payments History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <History size={16} className="text-secondary" />
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Historique des Paiements</h4>
                </div>

                {project.payments.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-4 bg-white/[0.02] rounded-xl text-center">Aucun paiement enregistré</p>
                ) : (
                  <div className="space-y-2">
                    {project.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/5 border border-secondary/10 hover:border-secondary/20 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 rounded-lg bg-secondary/20 text-secondary">
                              <ArrowUpRight size={14} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-white leading-none">{formatDate(p.payment_date)}</p>
                              <p className="text-[10px] text-text-muted mt-1 italic">{p.notes || 'Paiement standard'}</p>
                           </div>
                        </div>
                        <p className="text-xs font-black text-secondary">{formatCFA(p.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Recap */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                   <span className="font-bold text-text-muted uppercase text-[10px] tracking-widest">Reste à recouvrer :</span>
                   <span className={`font-black ${remaining <= 0 ? 'text-secondary' : 'text-primary'}`}>
                      {remaining <= 0 ? 'Soldé' : formatCFA(remaining)}
                   </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EcheancierList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'project' | 'timeline'>('project');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [stats, setStats] = useState({ totalPending: 0, totalPaid: 0, totalRemaining: 0, totalOverdue: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(name), schedules(*), payments(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const projs = data as Project[];
      setProjects(projs);
      
      // Calculate Global Stats
      let totalBudget = 0;
      let totalPaid = 0;
      let totalOverdue = 0;
      
      const today = new Date();
      today.setHours(0,0,0,0);

      projs.forEach(p => {
        totalBudget += p.total_budget;
        totalPaid += p.payments.reduce((sum, pay) => sum + pay.amount, 0);
        
        // Sum overdue schedules
        p.schedules.forEach(s => {
          if (s.status !== 'Payé') {
            const dueDate = new Date(s.due_date);
            if (dueDate < today) totalOverdue += s.amount;
          }
        });
      });
      
      setStats({
        totalPending: totalBudget - totalPaid,
        totalPaid: totalPaid,
        totalRemaining: totalBudget - totalPaid,
        totalOverdue: totalOverdue
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-text-muted font-bold text-sm tracking-widest uppercase">Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Global Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card flex items-center gap-5 border-l-4 border-primary bg-primary/5 shadow-xl shadow-primary/5">
          <div className="p-4 rounded-2xl bg-primary/20 text-primary">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Total à encaisser</p>
            <h3 className="text-xl font-black text-white">{formatCFA(stats.totalPending + stats.totalPaid)}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-5 border-l-4 border-secondary bg-secondary/5 shadow-xl shadow-secondary/5">
          <div className="p-4 rounded-2xl bg-secondary/20 text-secondary">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Total Encaissé</p>
            <h3 className="text-xl font-black text-white">{formatCFA(stats.totalPaid)}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-5 border-l-4 border-accent bg-accent/5 shadow-xl shadow-accent/5">
          <div className="p-4 rounded-2xl bg-accent/20 text-accent">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Reste à percevoir</p>
            <h3 className="text-xl font-black text-white">{formatCFA(stats.totalRemaining)}</h3>
          </div>
        </div>

        <div className="glass-card flex items-center gap-5 border-l-4 border-red-500 bg-red-400/5 shadow-xl shadow-red-400/5 animate-pulse">
          <div className="p-4 rounded-2xl bg-red-400/20 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] mb-1">Total en retard</p>
            <h3 className="text-xl font-black text-white">{formatCFA(stats.totalOverdue)}</h3>
          </div>
        </div>
      </div>


      {/* View Switcher & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('project')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'project' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
          >
            VUE PAR PROJET
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'timeline' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
          >
            CHRONOLOGIQUE
          </button>
        </div>

        {activeTab === 'timeline' && (
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'week', 'month'] as const).map(m => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === m ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.02] text-text-muted hover:border-white/20'}`}
              >
                {m === 'all' ? 'Tout' : m === 'today' ? 'Aujourd\'hui' : m === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects List with nested Schedules & Payments */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <DollarSign className="text-primary" size={16} />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight uppercase tracking-widest text-[14px]">Situation Financière par Projet</h2>
        </div>

        {activeTab === 'project' ? (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((p, i) => (
              <ProjectScheduleCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-0 overflow-hidden border border-white/5 bg-white/[0.02]">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-text-muted bg-white/[0.02]">
                  <th className="px-5 py-4 font-black text-center">Date prévue</th>
                  <th className="px-5 py-4 font-black">Projet / Client</th>
                  <th className="px-5 py-4 font-black">Statut</th>
                  <th className="px-5 py-4 font-black text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {projects.flatMap(p => p.schedules.map(s => ({ ...s, projectName: p.name, clientName: p.clients?.name || 'Inconnu' })))
                  .filter(s => {
                    if (filterMode === 'all') return true;
                    const date = new Date(s.due_date);
                    const now = new Date();
                    if (filterMode === 'today') return date.toDateString() === now.toDateString();
                    if (filterMode === 'week') {
                      const nextWeek = new Date(); nextWeek.setDate(now.getDate() + 7);
                      return date >= now && date <= nextWeek;
                    }
                    if (filterMode === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    return true;
                  })
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .map((s, i) => {
                    const isOverdue = s.status !== 'Payé' && new Date(s.due_date) < new Date(new Date().setHours(0,0,0,0));
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${isOverdue ? 'bg-red-400/10 border-red-400/20 text-red-500' : 'bg-white/5 border-white/5 text-text-muted'}`}>
                            <span className="text-xs font-black">{new Date(s.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-[9px] font-bold uppercase">{new Date(s.due_date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-bold text-white group-hover:text-primary transition-colors">{s.projectName}</p>
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-1">{s.clientName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            s.status === 'Payé' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 
                            isOverdue ? 'bg-red-400/10 text-red-500 border border-red-400/20 animate-pulse' : 'bg-white/5 text-text-muted border border-white/10'
                          }`}>
                            {isOverdue ? 'EN RETARD' : s.status}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-black text-white text-right">{formatCFA(s.amount)}</td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
            
            {projects.flatMap(p => p.schedules).length === 0 && (
              <div className="py-20 flex flex-col items-center">
                <Calendar size={48} className="text-white/10 mb-4" />
                <p className="text-text-muted font-bold text-sm">Aucune échéance à afficher</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
