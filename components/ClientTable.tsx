'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, UserPlus, Eye, Edit2, Trash2,
  Phone, Mail, MapPin, X, AlertTriangle, Building2, User,
  ChevronLeft, ChevronRight, Users, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  code: string | null;
  type: 'Particulier' | 'Entreprise';
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

type FormData = Omit<Client, 'id' | 'created_at' | 'code'>;

const emptyForm: FormData = {
  name: '',
  type: 'Particulier',
  email: '',
  phone: '',
  address: '',
};

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const Icon = type === 'success' ? CheckCircle2 : XCircle;
  const colorClass = type === 'success' ? 'text-secondary border-secondary/20 bg-secondary/10' : 'text-red-400 border-red-400/20 bg-red-400/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${colorClass}`}
    >
      <Icon size={18} />
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────
function ClientModal({
  isOpen, onClose, onSave, initialData, isSaving
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  initialData?: Client | null;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, type: initialData.type, email: initialData.email ?? '', phone: initialData.phone ?? '', address: initialData.address ?? '' });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  const inputClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm text-white placeholder:text-text-muted/40";
  const labelClass = "block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-0.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="glass-card w-full max-w-lg relative p-0 overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)' }}
          >
            {/* Top gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {initialData ? 'Modifier le client' : 'Nouveau client'}
                  </h3>
                  <p className="text-[10px] text-text-muted">
                    {initialData ? `Modification de ${initialData.name}` : 'Remplissez les informations du client'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Selector */}
              <div>
                <label className={labelClass}>Type de client</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Particulier', 'Entreprise'] as const).map((t) => {
                    const Icon = t === 'Particulier' ? User : Building2;
                    const isSelected = form.type === t;
                    return (
                      <button
                        key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold ${isSelected ? 'bg-primary/15 border-primary/50 text-white' : 'bg-white/[0.03] border-white/10 text-text-muted hover:border-white/20'}`}
                      >
                        <Icon size={16} className={isSelected ? 'text-primary' : ''} />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelClass}>
                  {form.type === 'Entreprise' ? "Nom de l'entreprise" : 'Nom complet'} <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={form.type === 'Entreprise' ? 'Ex: Alpha Corp SARL' : 'Ex: Jean Koffi'}
                  className={inputClass}
                />
              </div>

              {/* Email + Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@exemple.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input type="tel" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+229 97 00 00 00" className={inputClass} />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>Adresse</label>
                <input type="text" value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Cotonou, Bénin" className={inputClass} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white hover:border-white/20 font-bold text-sm transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSaving ? 'Enregistrement...' : (initialData ? 'Enregistrer les modifications' : 'Créer le client')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Client Details Modal ─────────────────────────────────────────────────────
function ClientDetailsModal({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      const fetchClientProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) setProjects(data);
        setLoading(false);
      };
      fetchClientProjects();
    } else {
      setProjects([]);
    }
  }, [client]);

  if (!client) return null;

  return (
    <AnimatePresence>
      {client && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-xl p-0 overflow-hidden border border-white/10"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
            
            <div className="p-8 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Header Details */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary font-black text-2xl shadow-xl shadow-primary/5">
                  {client.name.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-white">{client.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${client.type === 'Entreprise' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10'}`}>
                    {client.type}
                  </span>
                  {client.code && (
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      {client.code}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 mb-2">Informations de contact</h4>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Mail size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Email</p>
                        <p className="text-xs font-bold text-white truncate">{client.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                        <Phone size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Téléphone</p>
                        <p className="text-xs font-bold text-white truncate">{client.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                        <MapPin size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Adresse</p>
                        <p className="text-xs font-bold text-white truncate">{client.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40 mb-2">Projets associés ({projects.length})</h4>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                        <Loader2 size={16} className="animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Chargement...</span>
                      </div>
                    ) : projects.length > 0 ? (
                      projects.map((proj) => (
                        <div key={proj.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{proj.name}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                              proj.status === 'Terminé' ? 'text-secondary bg-secondary/10' : 
                              proj.status === 'Suspendu' ? 'text-red-400 bg-red-400/10' : 
                              'text-blue-400 bg-blue-400/10'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] font-bold text-text-muted">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(proj.total_budget)}</p>
                            <p className="text-[9px] text-text-muted/40">{proj.start_date ? new Date(proj.start_date).toLocaleDateString('fr-FR') : 'Sans date'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Aucun projet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/5"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ client, onConfirm, onClose, isDeleting }: { client: Client | null; onConfirm: () => void; onClose: () => void; isDeleting: boolean }) {
  return (
    <AnimatePresence>
      {client && (
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
              <h3 className="text-lg font-black text-white">Supprimer le client ?</h3>
              <p className="text-sm text-text-muted mt-1">
                <span className="text-white font-bold">{client.name}</span> et toutes ses données (projets, paiements) seront définitivement supprimés.
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

// ─── Client Card (Mobile View) ─────────────────────────────────────────────────
function ClientCard({ client, onEdit, onDelete, onView, index }: { client: Client; onEdit: (c: Client) => void; onDelete: (c: Client) => void; onView: (c: Client) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-4 group hover:border-white/15 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-base flex-shrink-0 border border-white/5">
            {client.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{client.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${client.type === 'Entreprise' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10'}`}>
                {client.type}
              </span>
              {client.code && (
                <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {client.code}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={() => onView(client)} className="p-2 rounded-lg bg-white/5 hover:bg-primary/10 text-text-muted hover:text-primary transition-all" title="Voir détails">
            <Eye size={14} />
          </button>
          <button onClick={() => onEdit(client)} className="p-2 rounded-lg bg-white/5 hover:bg-blue-400/10 text-text-muted hover:text-blue-400 transition-all">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(client)} className="p-2 rounded-lg bg-white/5 hover:bg-red-400/10 text-text-muted hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        {client.email && <p className="flex items-center gap-2 text-text-muted"><Mail size={11} className="text-primary flex-shrink-0" /><span className="truncate">{client.email}</span></p>}
        {client.phone && <p className="flex items-center gap-2 text-text-muted"><Phone size={11} className="text-secondary flex-shrink-0" />{client.phone}</p>}
        {client.address && <p className="flex items-center gap-2 text-text-muted"><MapPin size={11} className="text-accent flex-shrink-0" />{client.address}</p>}
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setClients(data as Client[]);
    else if (error) showToast('Erreur de chargement des clients.', 'error');
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Filtered & Paginated ─────────────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (c.phone ?? '').includes(searchTerm);
    const matchType = filterType === 'Tous' || c.type === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

  // ── Save (Create / Update) ────────────────────────────────────────────────────
  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
      };

      if (editingClient) {
        const { error } = await supabase.from('clients').update(payload).eq('id', editingClient.id);
        if (error) throw error;
        showToast(`Client "${formData.name}" modifié avec succès.`, 'success');
      } else {
        // Generate Unique Code CLT-ITA/YYYY/0001
        const year = new Date().getFullYear();
        const startOfYear = `${year}-01-01T00:00:00Z`;
        const endOfYear = `${year}-12-31T23:59:59Z`;

        const { count, error: countError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfYear)
          .lte('created_at', endOfYear);

        if (countError) throw countError;

        const nextNumber = (count || 0) + 1;
        const generatedCode = `CLT-ITA/${year}/${nextNumber.toString().padStart(4, '0')}`;
        
        const { error } = await supabase.from('clients').insert([{ ...payload, code: generatedCode }]);
        if (error) throw error;
        showToast(`Client "${formData.name}" créé avec succès ! Code: ${generatedCode}`, 'success');
      }
      setIsModalOpen(false);
      setEditingClient(null);
      await fetchClients();
    } catch {
      showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientToDelete.id);
      if (error) throw error;
      showToast(`Client "${clientToDelete.name}" supprimé.`, 'success');
      setClientToDelete(null);
      await fetchClients();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreate = () => { setEditingClient(null); setIsModalOpen(true); };
  const openEdit = (c: Client) => { setEditingClient(c); setIsModalOpen(true); };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Modals */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
        onSave={handleSave}
        initialData={editingClient}
        isSaving={isSaving}
      />
      <DeleteModal
        client={clientToDelete}
        onConfirm={handleDelete}
        onClose={() => setClientToDelete(null)}
        isDeleting={isDeleting}
      />
      <ClientDetailsModal
        client={viewingClient}
        onClose={() => setViewingClient(null)}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-white' },
          { label: 'Entreprises', value: clients.filter(c => c.type === 'Entreprise').length, color: 'text-blue-400' },
          { label: 'Particuliers', value: clients.filter(c => c.type === 'Particulier').length, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-card py-3 px-4 text-center hover:border-white/15 transition-all">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search, Filter & Actions Row ─ Fully Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-sm w-full text-white placeholder:text-text-muted/40"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-white outline-none appearance-none cursor-pointer w-full sm:w-auto"
          >
            <option value="Tous">Tous les types</option>
            <option value="Particulier">Particulier</option>
            <option value="Entreprise">Entreprise</option>
          </select>
        </div>

        {/* Button */}
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-primary/25 whitespace-nowrap"
        >
          <UserPlus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card py-20 flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-muted text-sm font-bold">Chargement des clients...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
            <Users size={28} className="text-text-muted/40" />
          </div>
          <div>
            <p className="font-black text-white">Aucun client enregistré</p>
            <p className="text-sm text-text-muted mt-1">Commencez par ajouter votre premier client.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all">
            <UserPlus size={16} /> Ajouter un client
          </button>
        </motion.div>
      )}

      {/* No Results State */}
      {!loading && clients.length > 0 && filtered.length === 0 && (
        <div className="glass-card py-16 flex flex-col items-center gap-3 text-center">
          <Search size={32} className="text-text-muted/30" />
          <p className="font-bold text-white">Aucun résultat</p>
          <p className="text-sm text-text-muted">Aucun client ne correspond à "{searchTerm}"</p>
          <button onClick={() => { setSearchTerm(''); setFilterType('Tous'); }} className="mt-1 text-sm text-primary hover:underline font-bold">Réinitialiser les filtres</button>
        </div>
      )}

      {/* Mobile Cards View (hidden on md+) */}
      {!loading && paginated.length > 0 && (
        <>
          <div className="grid gap-3 md:hidden">
            <AnimatePresence>
              {paginated.map((client, i) => (
                <ClientCard key={client.id} client={client} onEdit={openEdit} onDelete={setClientToDelete} onView={setViewingClient} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="glass-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-text-muted bg-white/[0.03]">
                    <th className="px-5 py-3.5 font-black text-center w-12">#</th>
                    <th className="px-5 py-3.5 font-black">Nom et prénoms</th>
                    <th className="px-5 py-3.5 font-black">ID</th>
                    <th className="px-5 py-3.5 font-black">Type</th>
                    <th className="px-5 py-3.5 font-black">Adresse</th>
                    <th className="px-5 py-3.5 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((client, i) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={client.id}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-5 py-4 text-center text-text-muted text-xs">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-sm border border-white/5 flex-shrink-0">
                              {client.name.charAt(0)}
                            </div>
                            <p className="font-bold text-white truncate max-w-[200px]">{client.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                           {client.code ? (
                             <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded inline-block tracking-tighter uppercase whitespace-nowrap">
                               {client.code}
                             </span>
                           ) : (
                             <span className="text-text-muted/30 text-xs">—</span>
                           )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${client.type === 'Entreprise' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10'}`}>
                            {client.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {client.address ? (
                            <p className="text-xs text-text-muted flex items-center gap-1.5">
                              <MapPin size={10} className="text-accent flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{client.address}</span>
                            </p>
                          ) : (
                            <span className="text-text-muted/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingClient(client)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                              title="Voir détails"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => openEdit(client)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-blue-400/10 text-text-muted hover:text-blue-400 transition-all"
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setClientToDelete(client)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-400/10 text-text-muted hover:text-red-400 transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-1">
              <p className="text-xs text-text-muted font-bold">
                Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} clients
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, k) => k + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${p === currentPage ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
