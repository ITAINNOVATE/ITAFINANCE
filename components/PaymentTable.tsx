'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Download, MoreHorizontal, CreditCard, Smartphone, Banknote,
  FileDown, Plus, X, Loader2, CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  project_id: string | null;
  client_id: string | null;
  amount: number;
  payment_method: 'Espèces' | 'Mobile Money' | 'Virement';
  payment_date: string;
  notes: string | null;
  created_at: string;
  // Joined stats
  clients?: { name: string } | null;
  projects?: { name: string } | null;
}

interface Project { id: string; name: string; client_id: string | null; }
interface Client { id: string; name: string; }

type FormData = {
  project_id: string;
  client_id: string;
  amount: string;
  payment_method: 'Espèces' | 'Mobile Money' | 'Virement';
  payment_date: string;
  notes: string;
};

const emptyForm: FormData = {
  project_id: '',
  client_id: '',
  amount: '',
  payment_method: 'Mobile Money',
  payment_date: new Date().toISOString().split('T')[0],
  notes: 'Avance sur projet'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
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

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ 
  isOpen, onClose, onSave, projects, clients, isSaving 
}: { 
  isOpen: boolean; onClose: () => void; 
  onSave: (data: FormData) => Promise<void>; 
  projects: Project[]; clients: Client[]; isSaving: boolean; 
}) {
  const [form, setForm] = useState<FormData>(emptyForm);

  // Auto-select client when project changes
  useEffect(() => {
    if (form.project_id) {
      const proj = projects.find(p => p.id === form.project_id);
      if (proj && proj.client_id) {
        setForm(f => ({ ...f, client_id: proj.client_id! }));
      }
    }
  }, [form.project_id, projects]);

  const inputClass = "w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm text-white placeholder:text-text-muted/40";
  const labelClass = "block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1.5 ml-0.5";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-md relative p-0 overflow-hidden flex flex-col"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)' }}
        >
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary flex-shrink-0" />
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText size={17} className="text-primary" />
              </div>
              <h3 className="text-base font-black text-white">Enregistrer un paiement</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white">
              <X size={16} />
            </button>
          </div>

          <form id="payment-form" onSubmit={async (e) => { e.preventDefault(); await onSave(form); }} className="p-6 space-y-4">
            
            {/* Project Select */}
             <div>
              <label className={labelClass}>Projet associé <span className="text-red-400">*</span></label>
              <select required value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className={inputClass}>
                <option value="">— Sélectionner un projet —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {projects.length === 0 && <p className="text-[10px] text-amber-400 mt-1">Aucun projet trouvé. Veuillez en créer un d'abord.</p>}
            </div>

            {/* Client Select */}
            <div>
              <label className={labelClass}>Client (Auto-rempli)</label>
              <select disabled required value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className={`${inputClass} opacity-60 cursor-not-allowed`}>
                <option value="">—</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Montant (CFA) <span className="text-red-400">*</span></label>
                <input required type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Ex: 500000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date de paiement <span className="text-red-400">*</span></label>
                <input required type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} className={`${inputClass} [color-scheme:dark]`} />
              </div>
            </div>

            {/* Method */}
            <div>
              <label className={labelClass}>Méthode de paiement</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Espèces', 'Mobile Money', 'Virement'] as const).map(m => {
                  const isSel = form.payment_method === m;
                  return (
                    <button
                      key={m} type="button" onClick={() => setForm(f => ({ ...f, payment_method: m }))}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all ${isSel ? 'border-primary/50 bg-primary/15 text-white' : 'border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20'}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Description / Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ex: Acompte 50%" className={inputClass} />
            </div>
            
          </form>

          <div className="px-6 py-4 border-t border-white/5 flex gap-3 bg-white/[0.02]">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:text-white font-bold text-sm">Annuler</button>
            <button type="submit" form="payment-form" disabled={isSaving || !form.project_id} className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch payments
    const { data: pData, error: pErr } = await supabase
      .from('payments')
      .select('*, projects(name), clients(name)')
      .order('created_at', { ascending: false });

    // Fetch projects & clients for the form
    const { data: prData } = await supabase.from('projects').select('id, name, client_id').order('name');
    const { data: clData } = await supabase.from('clients').select('id, name').order('name');

    if (!pErr) setPayments((pData ?? []) as Payment[]);
    if (prData) setProjects(prData as Project[]);
    if (clData) setClients(clData as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        project_id: form.project_id || null,
        client_id: form.client_id || null,
        amount: parseFloat(form.amount) || 0,
        payment_method: form.payment_method,
        payment_date: form.payment_date || new Date().toISOString(),
        notes: form.notes || null,
      };

      const { error } = await supabase.from('payments').insert([payload]);
      if (error) throw error;
      
      showToast('Paiement enregistré avec succès.', 'success');
      setIsModalOpen(false);
      await fetchData();
    } catch (e: any) {
      console.error(e);
      showToast("Erreur lors de l'enregistrement.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = (p: Payment) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // primary blue
      doc.text('ITA INNOVATE', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('REÇU DE PAIEMENT', 150, 20);
      
      // Line
      doc.setDrawColor(200);
      doc.line(20, 25, 190, 25);
      
      // Body
      doc.setFontSize(12);
      doc.setTextColor(0);
      const ref = p.id.split('-')[0].toUpperCase().substring(0, 8); // Short hash
      doc.text(`Référence: PAY-${ref}`, 20, 40);
      doc.text(`Date: ${formatDate(p.payment_date)}`, 20, 50);
      doc.text(`Heure d'édition: ${new Date().toLocaleTimeString('fr-FR')}`, 20, 56);
      
      // Client Details
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text('Client:', 20, 75);
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(p.clients?.name || '—', 20, 82);
      
      // Project Details
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text('Projet concerné:', 120, 75);
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(p.projects?.name || '—', 120, 82);
      
      // Table Header (Rectangle)
      doc.setFillColor(245, 247, 250);
      doc.rect(20, 100, 170, 12, 'F');
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text('Description / Notes', 25, 108);
      doc.text('Méthode', 110, 108);
      doc.text('Montant', 160, 108);
      
      // Table Row
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(p.notes || 'Règlement de service', 25, 122);
      doc.text(p.payment_method, 110, 122);
      doc.text(formatCFA(p.amount), 160, 122);

      // Line before total
      doc.setDrawColor(230);
      doc.line(20, 135, 190, 135);
      
      // Total amount
      doc.setFontSize(14);
      doc.setTextColor(80);
      doc.text('RÉGLÉ:', 110, 150);
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235); // primary blue
      doc.text(formatCFA(p.amount), 150, 150);
      
      // Footer text
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('Ce reçu est généré électroniquement par le système ITA Finance Manager.', 20, 275);
      doc.text('Merci de votre confiance.', 20, 280);
      
      doc.save(`Recu_ITA_${ref}.pdf`);
      showToast('Reçu PDF généré', 'success');
    } catch {
      showToast('Erreur génération PDF', 'error');
    }
  };

  const filtered = payments.filter(p => {
    const s = searchTerm.toLowerCase();
    return (p.clients?.name?.toLowerCase() || '').includes(s) || 
           (p.projects?.name?.toLowerCase() || '').includes(s) ||
           (p.notes?.toLowerCase() || '').includes(s);
  });

  const totalRevenue = filtered.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 flex flex-col items-center sm:items-stretch w-full">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <PaymentModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} projects={projects} clients={clients} isSaving={isSaving} 
      />

      {/* Header controls (Stats + Search) */}
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 w-full">
        <div className="glass-card px-5 py-3 flex flex-col bg-secondary/5 border-secondary/20 shadow-lg shadow-secondary/5">
          <span className="text-[10px] text-secondary font-black tracking-widest uppercase mb-0.5">Total Recettes</span>
          <span className="text-xl font-black text-white">{formatCFA(totalRevenue)}</span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" placeholder="Rechercher..." 
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/40 text-sm text-white"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Nouveau paiement</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card py-20 flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-primary mb-4" />
          <p className="text-text-muted font-bold text-sm">Chargement de l'historique...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center">
          <FileText size={48} className="text-white/10 mb-4" />
          <p className="text-white font-bold mb-1">Aucune transaction trouvée</p>
          <p className="text-text-muted text-sm text-center max-w-sm">Si vous cherchez un paiement spécifique, vérifiez les termes de recherche ou ajoutez un nouveau paiement.</p>
        </div>
      ) : (
        <div className="glass-card p-0 overflow-hidden shadow-xl w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-text-muted bg-white/[0.02]">
                  <th className="px-5 py-4 font-black">Date</th>
                  <th className="px-5 py-4 font-black">Projet / Client</th>
                  <th className="px-5 py-4 font-black">Méthode</th>
                  <th className="px-5 py-4 font-black">Description</th>
                  <th className="px-5 py-4 font-black text-right">Montant</th>
                  <th className="px-5 py-4 font-black text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((p, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-5 py-4 font-bold text-text-muted/80">{formatDate(p.payment_date)}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-white leading-tight">{p.projects?.name || '—'}</p>
                        <p className="text-[11px] font-medium text-text-muted flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>{p.clients?.name || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-text-muted">
                        {p.payment_method === 'Virement' && <CreditCard size={12} className="text-blue-400" />}
                        {p.payment_method === 'Mobile Money' && <Smartphone size={12} className="text-yellow-400" />}
                        {p.payment_method === 'Espèces' && <Banknote size={12} className="text-green-400" />}
                        {p.payment_method}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-muted truncate max-w-[200px]" title={p.notes || ''}>{p.notes || '—'}</td>
                    <td className="px-5 py-4 font-black text-secondary text-right">{formatCFA(p.amount)}</td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => generatePDF(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all border border-primary/20"
                      >
                        <FileDown size={14} />
                        <span className="text-[10px] font-black tracking-wider uppercase">Reçu</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
