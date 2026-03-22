'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, Save, Calendar, Tag, DollarSign, FileText, 
  Briefcase, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: any;
}

const CATEGORIES = [
  'Loyer', 'Salaires', 'Marketing', 'Investissements', 
  'Transport', 'Fournitures', 'Services', 'Divers'
];

export default function ExpenseModal({ isOpen, onClose, onSuccess, expense }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    category: 'Divers',
    status: 'pending',
    planned_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    project_id: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
    if (expense) {
      setFormData({
        label: expense.label || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'Divers',
        status: expense.status || 'pending',
        planned_date: expense.planned_date || new Date().toISOString().split('T')[0],
        payment_date: expense.payment_date || '',
        project_id: expense.project_id || '',
        reference: expense.reference || '',
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, nom:name, clients(name)')
      .order('name', { ascending: true });
    
    if (data) setProjects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      project_id: formData.project_id || null,
      payment_date: formData.status === 'paid' ? (formData.payment_date || new Date().toISOString().split('T')[0]) : null
    };

    let error;
    if (expense?.id) {
      const { error: err } = await supabase.from('expenses').update(payload).eq('id', expense.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('expenses').insert([payload]);
      error = err;
    }

    if (!error) {
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl p-6 md:p-8 relative z-10 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight text-gradient">
              {expense ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
            </h2>
            <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">
              {formData.status === 'pending' ? 'Programmation d\'une échéance' : 'Enregistrement d\'un paiement'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Libellé */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Libellé de la dépense</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="text" required value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white"
                  placeholder="ex: Loyer Bureau Mars"
                />
              </div>
            </div>

            {/* Montant */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Montant (FCFA)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="number" required value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Catégorie</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-background text-white">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Projet Associé */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Projet Associé (Optionnel)</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <select 
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white appearance-none cursor-pointer"
                >
                  <option value="" className="bg-background text-white">Aucun projet associé</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-background text-white">
                      {p.clients?.name ? `${p.clients.name} - ` : ''}{p.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Statut</label>
              <div className="flex p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl gap-2">
                <button 
                  type="button" onClick={() => setFormData({ ...formData, status: 'pending' })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${formData.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10' : 'text-text-muted hover:text-white'}`}
                >
                  En instance
                </button>
                <button 
                  type="button" onClick={() => setFormData({ ...formData, status: 'paid' })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${formData.status === 'paid' ? 'bg-secondary/20 text-secondary border border-secondary/30 shadow-lg shadow-secondary/10' : 'text-text-muted hover:text-white'}`}
                >
                  Payée
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Date prévue</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="date" required value={formData.planned_date}
                  onChange={e => setFormData({ ...formData, planned_date: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white"
                />
              </div>
            </div>

            {formData.status === 'paid' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Date de paiement</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="date" required={formData.status === 'paid'} value={formData.payment_date}
                    onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white"
                  />
                </div>
              </div>
            )}

            {/* Référence */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">No. Référence / Facture</label>
              <input 
                type="text" value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white"
                placeholder="ex: FACT-2026-001"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" onClick={onClose}
              className="flex-1 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:bg-white/10 transition-all uppercase tracking-widest"
            >
              Annuler
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="flex-1 py-4.5 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {expense ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
