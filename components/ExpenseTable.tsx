'use client';

import React, { useEffect, useState } from 'react';
import { supabase, PLATFORM_ID } from '../lib/supabase';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  Paperclip, 
  Tag,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Briefcase,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseModal from './ExpenseModal';

// ─── Expense Card (Mobile View) ────────────────────────────────────────────────
function ExpenseCard({ 
  expense: d, 
  onMarkAsPaid, 
  onEdit, 
  onDelete 
}: { 
  expense: any; 
  onMarkAsPaid: (id: string) => void;
  onEdit: (e: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${d.status === 'paid' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <TrendingDown size={14} />
          </div>
          <div>
            <p className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight">{d.label}</p>
            <p className="text-[10px] text-text-muted font-mono mt-0.5">{d.reference || 'SANS RÉF'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-red-500 tracking-tight">-{new Intl.NumberFormat('fr-FR').format(d.amount)}</p>
          <div className={`mt-1.5 px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[9px] font-black uppercase ${d.status === 'paid' ? 'bg-secondary/10 border border-secondary/20 text-secondary' : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'}`}>
            {d.status === 'paid' ? <CheckCircle2 size={9} /> : <Clock size={9} />}
            {d.status === 'paid' ? 'Payée' : 'Instance'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-text-muted uppercase">
          <Tag size={10} className="text-primary" /> {d.category}
        </span>
        {d.projects && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase">
            <Briefcase size={10} /> {d.projects.name}
          </span>
        )}
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white uppercase">
          <Calendar size={10} className="text-accent" /> {new Date(d.planned_date).toLocaleDateString('fr-FR')}
        </span>
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/5">
        {d.status === 'pending' && (
          <button 
            onClick={() => onMarkAsPaid(d.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl transition-all font-black text-[10px] uppercase"
          >
            <CheckCircle2 size={12} /> Payer
          </button>
        )}
        <button 
          onClick={() => onEdit(d)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={() => onDelete(d.id)}
          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all border border-white/5"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    monthly: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*, projects(name)')
      .eq('platform_id', PLATFORM_ID)
      .order('planned_date', { ascending: false });

    if (!error) {
      setExpenses(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = data.reduce((acc, curr) => {
      const expDate = new Date(curr.planned_date);
      if (curr.status === 'paid') acc.paid += curr.amount;
      else acc.pending += curr.amount;

      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        acc.monthly += curr.amount;
      }
      return acc;
    }, { paid: 0, pending: 0, monthly: 0 });

    setStats({ ...stats, total: stats.paid + stats.pending });
  };

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .update({ 
        status: 'paid', 
        payment_date: new Date().toISOString().split('T')[0] 
      })
      .eq('id', id)
      .eq('platform_id', PLATFORM_ID);
    
    if (!error) fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('platform_id', PLATFORM_ID);
    if (!error) fetchExpenses();
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch = e.label.toLowerCase().includes(search.toLowerCase()) || 
                         e.reference?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Ce Mois', value: formatAmount(stats.monthly), color: 'border-primary', icon: Calendar },
          { label: 'Instance', value: formatAmount(stats.pending), color: 'border-orange-400', icon: Clock },
          { label: 'Total Payé', value: formatAmount(stats.paid), color: 'border-secondary', icon: CheckCircle2 },
          { label: 'Budget', value: formatAmount(stats.total), color: 'border-purple-400', icon: TrendingDown },
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-3 sm:p-5 border-b-2 ${stat.color} relative overflow-hidden group`}>
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={48} className="sm:size-16" />
            </div>
            <p className="text-[8px] sm:text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1 truncate">{stat.label}</p>
            <p className="text-sm sm:text-xl font-black text-white">{stat.value} <span className="text-[8px] sm:text-[10px] opacity-60">FCFA</span></p>
          </div>
        ))}
      </div>

      {/* Main Interface */}
      <div className="glass-card border border-white/5 overflow-hidden p-0">
        <div className="p-4 sm:p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-stretch sm:items-center">
            {/* Tabs Filter */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'pending', label: 'En instance' },
                { id: 'paid', label: 'Payées' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              <div className="relative group flex-1 min-w-0 sm:min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..." 
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white"
                />
              </div>

              <button 
                onClick={() => { setSelectedExpense(null); setIsModalOpen(true); }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/90 hover:bg-red-500 text-white rounded-2xl font-black text-[10px] transition-all shadow-xl shadow-red-500/20 uppercase tracking-widest border border-red-500/20 whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
               <TrendingDown size={48} className="text-white/5 mb-4" />
               <p className="text-white font-bold">Aucune dépense trouvée</p>
               <p className="text-text-muted text-sm mt-1 max-w-xs">Ajustez vos filtres ou enregistrez une nouvelle dépense.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="grid gap-4 p-4 lg:hidden">
                {filteredExpenses.map(e => (
                  <ExpenseCard 
                    key={e.id} 
                    expense={e} 
                    onMarkAsPaid={handleMarkAsPaid}
                    onEdit={(exp) => { setSelectedExpense(exp); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-text-muted bg-white/[0.02]">
                      <th className="px-6 py-5 font-black">Libellé / Réf</th>
                      <th className="px-6 py-5 font-black">Catégorie & Projet</th>
                      <th className="px-6 py-5 font-black text-center">Échéance</th>
                      <th className="px-6 py-5 font-black">Montant</th>
                      <th className="px-6 py-5 font-black">Statut</th>
                      <th className="px-6 py-5 font-black text-right pr-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredExpenses.map((d, i) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        key={d.id} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${d.status === 'paid' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                              <TrendingDown size={14} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{d.label}</p>
                              <p className="text-[10px] text-text-muted font-mono">{d.reference || 'SANS RÉF'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
                              <Tag size={10} className="text-primary" /> {d.category}
                            </span>
                            {d.projects && (
                              <span className="flex items-center gap-1.5 text-[9px] font-black text-secondary uppercase tracking-tighter">
                                <Briefcase size={10} /> {d.projects.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="text-[11px] font-bold text-white bg-white/5 py-1 px-3 rounded-lg inline-block">
                            {new Date(d.planned_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-red-500 tracking-tight">-{formatAmount(d.amount)} <span className="text-[9px] opacity-60">FCFA</span></p>
                        </td>
                        <td className="px-6 py-5">
                          {d.status === 'paid' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[9px] font-black text-secondary uppercase w-fit">
                              <CheckCircle2 size={10} /> Payée
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-400 uppercase w-fit">
                              <Clock size={10} /> En instance
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right flex justify-end gap-2 pr-10">
                           {d.status === 'pending' && (
                            <button 
                              onClick={() => handleMarkAsPaid(d.id)}
                              title="Marquer comme payé"
                              className="p-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all border border-secondary/20"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => { setSelectedExpense(d); setIsModalOpen(true); }}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(d.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all border border-white/5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchExpenses}
        expense={selectedExpense}
      />
    </div>
  );
}
