'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Calendar, Clock, Edit2, Trash2, X, AlertTriangle,
  User, CheckCircle2, AlertCircle, Loader2, CheckCircle,
  XCircle, TrendingUp, Briefcase, Search, Filter, ChevronDown,
  ArrowRight, PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  total_budget: number;
  start_date: string | null;
  end_date: string | null;
  status: 'En cours' | 'Terminé' | 'Suspendu';
  created_at: string;
  // Joined
  clients?: { name: string } | null;
  // Computed
  total_paid?: number;
}

interface Client {
  id: string;
  name: string;
}

type FormData = {
  name: string;
  client_id: string;
  description: string;
  total_budget: string;
  start_date: string;
  end_date: string;
  status: 'En cours' | 'Terminé' | 'Suspendu';
};

const emptyForm: FormData = {
  name: '',
  client_id: '',
  description: '',
  total_budget: '',
  start_date: '',
  end_date: '',
  status: 'En cours',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getProgress(totalBudget: number, totalPaid: number) {
  if (!totalBudget || totalBudget === 0) return 0;
  return Math.min(100, Math.round((totalPaid / totalBudget) * 100));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const Icon = type === 'success' ? CheckCircle : XCircle;
  const cls = type === 'success' ? 'text-secondary border-secondary/20 bg-secondary/10' : 'text-red-400 border-red-400/20 bg-red-400/10';
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${cls}`}
    >
      <Icon size={18} />
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    'En cours':  { color: 'bg-primary/10 text-primary border-primary/20', icon: <TrendingUp size={10} /> },
    'Terminé':   { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: <CheckCircle2 size={10} /> },
    'Suspendu':  { color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: <PauseCircle size={10} /> },
  };
  const m = map[status] ?? map['En cours'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${m.color}`}>
      {m.icon} {status}
    </span>
  );
}

// ─── Project Modal ────────────────────────────────────────────────────────────
function ProjectModal({
  isOpen, onClose, onSave, initialData, clients, isSaving
}: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData?: Project | null;
  clients: Client[];
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        client_id: initialData.client_id ?? '',
        description: initialData.description ?? '',
        total_budget: String(initialData.total_budget),
        start_date: initialData.start_date ?? '',
        end_date: initialData.end_date ?? '',
        status: initialData.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, isOpen]);

  const inputClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm text-white placeholder:text-text-muted/40";
  const labelClass = "block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-0.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card w-full max-w-lg relative p-0 overflow-hidden max-h-[90vh] flex flex-col"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)' }}
          >
            {/* Gradient bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Briefcase size={17} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{initialData ? 'Modifier le projet' : 'Nouveau projet'}</h3>
                  <p className="text-[10px] text-text-muted">{initialData ? initialData.name : 'Remplissez les informations du projet'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="overflow-y-auto flex-1">
              <form id="project-form" onSubmit={async (e) => { e.preventDefault(); await onSave(form); }} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className={labelClass}>Nom du projet <span className="text-red-400">*</span></label>
                  <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Refonte Site Web ITA" className={inputClass} />
                </div>

                {/* Client Searchable Select */}
                <div className="relative">
                  <label className={labelClass}>Client associé <span className="text-red-400">*</span></label>
                  
                  {/* Custom Searchable Select */}
                  <div className="relative">
                    <div 
                      className={`${inputClass} !pl-10 flex items-center cursor-pointer group hover:border-primary/40 transition-all ${!form.client_id ? 'text-text-muted/60' : 'text-white font-bold'}`}
                      onClick={() => setIsClientSelectOpen(!isClientSelectOpen)}
                    >
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
                      <span className="truncate">
                        {form.client_id 
                          ? clients.find(c => c.id === form.client_id)?.name || 'Client inconnu' 
                          : 'Chercher un client...'}
                      </span>
                      <ChevronDown 
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-transform duration-200 ${isClientSelectOpen ? 'rotate-180 text-primary' : ''}`} 
                        size={15} 
                      />
                    </div>

                    <AnimatePresence>
                      {isClientSelectOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.98 }}
                          className="absolute z-[60] left-0 right-0 mt-2 bg-[#0a0c10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                          {/* Search Input inside Dropdown */}
                          <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                              <input
                                autoFocus
                                type="text"
                                placeholder="Rechercher..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* List */}
                          <div className="max-h-[200px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-white/10">
                            {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 ? (
                              <div className="py-8 text-center">
                                <Search size={20} className="mx-auto text-text-muted/20 mb-2" />
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Aucun résultat</p>
                              </div>
                            ) : (
                              clients
                                .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
                                .map(c => (
                                  <div
                                    key={c.id}
                                    onClick={() => {
                                      setForm(f => ({ ...f, client_id: c.id }));
                                      setIsClientSelectOpen(false);
                                      setClientSearch('');
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${form.client_id === c.id ? 'bg-primary/20 text-white border border-primary/20' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                                  >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border ${form.client_id === c.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5'}`}>
                                      {c.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold truncate">{c.name}</span>
                                    {form.client_id === c.id && <CheckCircle2 size={14} className="ml-auto text-primary" />}
                                  </div>
                                ))
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                            <a 
                              href="/clients" 
                              target="_blank"
                              className="flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                            >
                              Gérer les clients <Plus size={10} />
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {clients.length === 0 && (
                    <p className="text-[11px] text-amber-400/80 mt-1.5 ml-1 flex items-center gap-1.5">
                      <AlertCircle size={11} />
                      Aucun client enregistré.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Décrivez les objectifs du projet..."
                    className={`${inputClass} min-h-[80px] resize-none`}
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className={labelClass}>Budget total (FCFA) <span className="text-red-400">*</span></label>
                  <input
                    required type="number" min="0"
                    value={form.total_budget}
                    onChange={e => setForm(f => ({ ...f, total_budget: e.target.value }))}
                    placeholder="Ex: 2500000"
                    className={inputClass}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date de début</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
                  </div>
                  <div>
                    <label className={labelClass}>Date de fin</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={labelClass}>Statut</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['En cours', 'Terminé', 'Suspendu'] as const).map(s => {
                      const colors: Record<string, string> = { 'En cours': 'border-primary/50 bg-primary/15 text-white', 'Terminé': 'border-secondary/50 bg-secondary/15 text-white', 'Suspendu': 'border-red-400/50 bg-red-400/15 text-white' };
                      const isSelected = form.status === s;
                      return (
                        <button
                          key={s} type="button"
                          onClick={() => setForm(f => ({ ...f, status: s }))}
                          className={`py-2.5 rounded-xl border text-xs font-black transition-all ${isSelected ? colors[s] : 'border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20'}`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex gap-3 flex-shrink-0 bg-white/[0.02]">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:border-white/20 font-bold text-sm transition-all">
                Annuler
              </button>
              <button
                type="submit" form="project-form" disabled={isSaving}
                className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Enregistrement...' : (initialData ? 'Enregistrer' : 'Créer le projet')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ project, onConfirm, onClose, isDeleting }: { project: Project | null; onConfirm: () => void; onClose: () => void; isDeleting: boolean }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card w-full max-w-sm p-6 text-center space-y-4"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(239,68,68,0.1)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Supprimer le projet ?</h3>
              <p className="text-sm text-text-muted mt-1">
                <span className="text-white font-bold">{project.name}</span> sera définitivement supprimé avec tous ses paiements et échéanciers.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-muted hover:text-white font-bold text-sm transition-all">Annuler</button>
              <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project, index, onEdit, onDelete
}: {
  project: Project; index: number;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const paid = project.total_paid ?? 0;
  const budget = project.total_budget ?? 0;
  const progress = getProgress(budget, paid);
  const remaining = Math.max(0, budget - paid);
  const clientName = project.clients?.name ?? '—';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card flex flex-col group overflow-hidden hover:border-white/15 transition-all"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
    >
      {/* Top colored accent line */}
      <div className={`h-0.5 -mx-6 -mt-6 mb-6 ${project.status === 'Terminé' ? 'bg-secondary' : project.status === 'Suspendu' ? 'bg-red-400' : 'bg-primary'}`} />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={project.status} />
            {project.end_date && (
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock size={10} /> {formatDate(project.end_date)}
              </span>
            )}
          </div>
          <h3 className="text-base font-black text-white group-hover:text-primary transition-colors truncate">{project.name}</h3>
          {clientName !== '—' && (
            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
              <User size={11} className="text-primary/60 flex-shrink-0" />
              <span className="truncate">{clientName}</span>
            </p>
          )}
          {project.description && (
            <p className="text-xs text-text-muted/60 mt-2 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-lg bg-white/5 hover:bg-blue-400/10 text-text-muted hover:text-blue-400 transition-all"
            title="Modifier"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(project)}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-400/10 text-text-muted hover:text-red-400 transition-all"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-text-muted">Progression financière</span>
          <span className={progress === 100 ? 'text-secondary' : 'text-white'}>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.07 + 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full ${project.status === 'Terminé' ? 'bg-secondary' : project.status === 'Suspendu' ? 'bg-red-400' : 'bg-gradient-to-r from-primary to-accent'}`}
          />
        </div>
      </div>

      {/* Budget Grid */}
      <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-black mb-1">Budget</p>
          <p className="text-sm font-black text-white">{(budget / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-black mb-1">Reçu</p>
          <p className="text-sm font-black text-secondary">{(paid / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-black mb-1">Reste</p>
          <p className={`text-sm font-black ${remaining > 0 ? 'text-red-400' : 'text-secondary'}`}>{(remaining / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-between items-center bg-white/[0.03] -mx-6 -mb-6 px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {progress === 100 ? (
            <><CheckCircle2 size={14} className="text-secondary" /><span className="text-xs text-secondary font-bold">Soldé</span></>
          ) : (
            <><AlertCircle size={14} className="text-accent" /><span className="text-xs text-text-muted">{formatCFA(remaining)} restant</span></>
          )}
        </div>
        <span className="text-[10px] text-text-muted flex items-center gap-1">
          <Calendar size={10} /> {formatDate(project.start_date)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  // Fetch projects with total_paid from payments
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Erreur de chargement des projets.', 'error');
      setLoading(false);
      return;
    }

    // Fetch total_paid per project from payments
    const { data: payments } = await supabase
      .from('payments')
      .select('project_id, amount');

    const paidMap: Record<string, number> = {};
    (payments ?? []).forEach((p: { project_id: string; amount: number }) => {
      paidMap[p.project_id] = (paidMap[p.project_id] ?? 0) + Number(p.amount);
    });

    const enriched = (data ?? []).map((p: Project) => ({
      ...p,
      total_paid: paidMap[p.id] ?? 0,
    }));

    setProjects(enriched);
    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    setClients((data ?? []) as Client[]);
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, [fetchProjects, fetchClients]);

  // Filter & search
  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clients?.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: projects.length,
    enCours: projects.filter(p => p.status === 'En cours').length,
    termines: projects.filter(p => p.status === 'Terminé').length,
    suspendus: projects.filter(p => p.status === 'Suspendu').length,
    totalBudget: projects.reduce((s, p) => s + (p.total_budget ?? 0), 0),
  };

  // Save
  const handleSave = async (form: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        client_id: form.client_id || null,
        description: form.description || null,
        total_budget: parseFloat(form.total_budget) || 0,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
      };

      if (editingProject) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
        if (error) throw error;
        showToast(`Projet "${form.name}" modifié.`, 'success');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        showToast(`Projet "${form.name}" créé !`, 'success');
      }
      setIsModalOpen(false);
      setEditingProject(null);
      await fetchProjects();
    } catch {
      showToast('Une erreur est survenue.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
      if (error) throw error;
      showToast(`Projet "${projectToDelete.name}" supprimé.`, 'success');
      setProjectToDelete(null);
      await fetchProjects();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreate = () => { setEditingProject(null); setIsModalOpen(true); };
  const openEdit = (p: Project) => { setEditingProject(p); setIsModalOpen(true); };

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Modals */}
      <ProjectModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingProject(null); }} onSave={handleSave} initialData={editingProject} clients={clients} isSaving={isSaving} />
      <DeleteModal project={projectToDelete} onConfirm={handleDelete} onClose={() => setProjectToDelete(null)} isDeleting={isDeleting} />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total projets', value: stats.total, color: 'text-white' },
          { label: 'En cours', value: stats.enCours, color: 'text-primary' },
          { label: 'Terminés', value: stats.termines, color: 'text-secondary' },
          { label: 'Suspendus', value: stats.suspendus, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass-card py-3 px-4 text-center hover:border-white/15 transition-all">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Budget total highlight */}
      <div className="glass-card py-3 px-5 flex items-center justify-between">
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Volume total des projets</p>
        <p className="text-xl font-black text-white">{formatCFA(stats.totalBudget)}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text" placeholder="Rechercher un projet ou client..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm w-full text-white placeholder:text-text-muted/40"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white outline-none appearance-none cursor-pointer w-full sm:w-auto"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Suspendu">Suspendu</option>
          </select>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/25 whitespace-nowrap"
        >
          <Plus size={16} /> Nouveau projet
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card py-20 flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-muted text-sm font-bold">Chargement des projets...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
            <Briefcase size={28} className="text-text-muted/40" />
          </div>
          <div>
            <p className="font-black text-white">Aucun projet enregistré</p>
            <p className="text-sm text-text-muted mt-1">Commencez par créer votre premier projet.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all">
            <Plus size={16} /> Créer un projet
          </button>
        </motion.div>
      )}

      {/* No results */}
      {!loading && projects.length > 0 && filtered.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center gap-3 text-center">
          <Search size={32} className="text-text-muted/30" />
          <p className="font-bold text-white">Aucun résultat</p>
          <p className="text-sm text-text-muted">Aucun projet pour "{searchTerm}"</p>
          <button onClick={() => { setSearchTerm(''); setFilterStatus('Tous'); }} className="mt-1 text-sm text-primary hover:underline font-bold">
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 pb-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onEdit={openEdit}
                onDelete={setProjectToDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
