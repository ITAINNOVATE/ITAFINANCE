'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  UserPlus, Shield, ShieldCheck, Mail, Save, X, Trash2, 
  Settings, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
}

const MODULES = [
  { id: 'clients', name: 'Clients' },
  { id: 'projets', name: 'Projets' },
  { id: 'paiements', name: 'Paiements' },
  { id: 'echeanciers', name: 'Échéanciers' },
  { id: 'depenses', name: 'Dépenses' },
  { id: 'rapports', name: 'Rapports' },
  { id: 'admin', name: 'Administration' },
];

export default function AdminTable() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '' });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error) setProfiles(data);
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return;
    setIsCreating(true);
    const { error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });
    
    if (!error) {
      // Trigger handles profile creation, but it might take a sec
      setTimeout(fetchProfiles, 1000);
      setIsCreateModalOpen(false);
      setNewUser({ email: '', password: '' });
    } else {
      alert(error.message);
    }
    setIsCreating(false);
  };

  const handleTogglePermission = (moduleId: string) => {
    if (!selectedProfile) return;
    const newPerms = selectedProfile.permissions.includes(moduleId)
      ? selectedProfile.permissions.filter(p => p !== moduleId)
      : [...selectedProfile.permissions, moduleId];
    setSelectedProfile({ ...selectedProfile, permissions: newPerms });
  };

  const handleSave = async () => {
    if (!selectedProfile) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        role: selectedProfile.role,
        permissions: selectedProfile.permissions
      })
      .eq('id', selectedProfile.id);

    if (!error) {
      await fetchProfiles();
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-6 rounded-3xl">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight text-gradient">Gestion des Utilisateurs</h3>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Gérer les accès et les permissions</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-[10px] transition-all shadow-xl shadow-primary/20 flex items-center gap-2 uppercase tracking-widest"
        >
          <UserPlus size={16} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Utilisateur</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Rôle</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Permissions</th>
              <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Mail size={14} className="text-text-muted" />
                    </div>
                    <span className="text-sm font-bold text-white">{p.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-tighter ${p.role === 'admin' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                    {p.role === 'admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                    {p.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {p.permissions.length === 0 ? (
                      <span className="text-[10px] text-text-muted/40 italic">Aucun accès</span>
                    ) : (
                      p.permissions.slice(0, 3).map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] text-primary font-bold">{m}</span>
                      ))
                    )}
                    {p.permissions.length > 3 && <span className="text-[9px] text-text-muted font-bold">+{p.permissions.length - 3}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setSelectedProfile(p); setIsModalOpen(true); }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
                  >
                    <Settings size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Nouvel Utilisateur</h3>
                  <p className="text-xs text-text-muted font-bold mt-1">L'utilisateur recevra un mail de confirmation</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-sm text-white"
                    placeholder="exemple@ita.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Mot de passe temporaire</label>
                  <input 
                    type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-sm text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  disabled={isCreating}
                  onClick={handleCreateUser}
                  className="flex-1 py-4.5 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  Créer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal remains below ... */}

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-8 relative z-10 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Configuration des Accès</h3>
                  <p className="text-xs text-text-muted font-bold mt-1">{selectedProfile.email}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Role Toggle */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-3">Rôle système</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['user', 'admin'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setSelectedProfile({ ...selectedProfile, role: r as any })}
                        className={`py-3 rounded-xl border font-bold text-sm transition-all ${selectedProfile.role === r ? 'bg-primary/20 border-primary/50 text-white shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 text-text-muted hover:border-white/20'}`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Checkbox */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-3">Modules Autorisés</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MODULES.map(m => {
                      const isAllowed = selectedProfile.permissions.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleTogglePermission(m.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-xs font-bold ${isAllowed ? 'bg-secondary/10 border-secondary/30 text-white' : 'bg-white/[0.02] border-white/5 text-text-muted/60 opacity-60'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isAllowed ? 'bg-secondary border-secondary text-background' : 'border-white/20'}`}>
                            {isAllowed && <CheckCircle2 size={10} />}
                          </div>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="flex-1 py-4.5 rounded-2xl bg-primary text-white font-black text-xs hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
