'use client';

import React from 'react';
import AdminTable from '../../components/AdminTable';
import { ShieldCheck, UserPlus, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20">
              <ShieldCheck size={20} className="text-secondary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight font-premium text-gradient">Administration</h1>
          </div>
          <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] opacity-60">Gestion de la sécurité et des accès modules</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-text-muted font-bold">
            <Info size={14} className="text-primary" />
            L'ADMINISTRATEUR A ACCÈS À TOUS LES MODULES PAR DÉFAUT
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminTable />
      </motion.div>
    </div>
  );
}
