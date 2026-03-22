'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  ChevronRight,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const mockEcheances = [
  { id: 1, projet: 'E-commerce ITA', client: 'ITA Innovate', dueDate: '22 Mars 2026', amount: '250.000', status: 'En retard', priority: 'high' },
  { id: 2, projet: 'Refonte Site Web', client: 'Alpha Corp', dueDate: '25 Mars 2026', amount: '500.000', status: 'En attente', priority: 'medium' },
  { id: 3, projet: 'App Mobile v2', client: 'Bêta SARL', dueDate: '30 Mars 2026', amount: '1.200.000', status: 'En attente', priority: 'low' },
  { id: 4, projet: 'Audit Sécurité', client: 'Gamma SA', dueDate: '15 Avril 2026', amount: '450.000', status: 'Payé', priority: 'none' },
];

export default function EcheancierList() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-4 border-l-4 border-red-500">
          <div className="p-3 rounded-xl bg-red-400/10 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">EN RETARD</p>
            <h3 className="text-xl font-bold">1.250.000 <span className="text-xs">FCFA</span></h3>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 border-l-4 border-accent">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <Clock3 size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">À VENIR (7j)</p>
            <h3 className="text-xl font-bold">3.400.000 <span className="text-xs">FCFA</span></h3>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 border-l-4 border-secondary">
          <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">PAYÉ CE MOIS</p>
            <h3 className="text-xl font-bold">8.600.000 <span className="text-xs">FCFA</span></h3>
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Prochaines Échéances
          </h3>
          <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            VOIR CALENDRIER <ChevronRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {mockEcheances.map((e, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={e.id} 
              className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                  e.status === 'Payé' ? 'bg-secondary/20 text-secondary' : 
                  e.status === 'En retard' ? 'bg-red-400/20 text-red-500' : 'bg-primary/20 text-primary'
                }`}>
                  {e.dueDate.split(' ')[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight group-hover:text-primary transition-colors">{e.projet}</h4>
                  <p className="text-xs text-text-muted mt-0.5">{e.client}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider mb-1">Montant</p>
                  <p className="font-bold text-white">{e.amount} FCFA</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider mb-1">Date Limite</p>
                  <p className="text-sm font-medium text-text-muted">{e.dueDate}</p>
                </div>
                <div className="md:text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    e.status === 'Payé' ? 'bg-secondary/10 text-secondary' : 
                    e.status === 'En retard' ? 'bg-red-400/10 text-red-500 animate-pulse' : 'bg-accent/10 text-accent'
                  }`}>
                    {e.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-all" title="Envoyer un rappel">
                  <Bell size={18} />
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary text-white transition-all text-xs font-bold">
                  VALIDER
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
