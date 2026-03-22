'use client';

import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { RevenueChart, ExpenseDistribution } from '../components/Charts';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="space-y-8 min-h-screen">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Solde Actuel" 
          value="12 450 000 FCFA" 
          icon={Wallet} 
          trend={{ value: "+12%", positive: true }}
          color="primary"
        />
        <StatCard 
          title="Entrées du mois" 
          value="4 200 000 FCFA" 
          icon={TrendingUp} 
          trend={{ value: "+5.2%", positive: true }}
          color="secondary"
        />
        <StatCard 
          title="Dépenses du mois" 
          value="1 850 000 FCFA" 
          icon={TrendingDown} 
          trend={{ value: "-2.4%", positive: false }}
          color="accent"
        />
        <StatCard 
          title="Projets Actifs" 
          value="24" 
          icon={Briefcase} 
          color="primary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Évolution de la Trésorerie</h3>
              <p className="text-sm text-text-muted">Revenus vs Dépenses (6 derniers mois)</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-white cursor-pointer hover:bg-white/10">
              <option className="bg-background">Cette année</option>
              <option className="bg-background">L'année dernière</option>
            </select>
          </div>
          <RevenueChart />
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-2">Répartition des Dépenses</h3>
          <p className="text-sm text-text-muted mb-6">Par catégorie ce mois</p>
          <ExpenseDistribution />
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Salaires</span>
              <span className="font-semibold">40%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> Achats</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent"></span> Charges</span>
              <span className="font-semibold">30%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Recent Projects */}
        <div className="glass-card overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-6 pt-6">
            <h3 className="text-lg font-bold text-white">Projets Récents</h3>
            <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-[0.15em] text-text-muted/60 bg-white/2">
                  <th className="px-8 py-5 font-bold">Projet</th>
                  <th className="px-8 py-5 font-bold">Client</th>
                  <th className="px-8 py-5 font-bold">Status</th>
                  <th className="px-8 py-5 font-bold">Budget</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Refonte Site Web', client: 'Alpha Corp', status: 'En cours', statusColor: 'text-primary bg-primary/10', budget: '2.5M' },
                  { name: 'App Mobile v2', client: 'Bêta SARL', status: 'Terminé', statusColor: 'text-secondary bg-secondary/10', budget: '5.0M' },
                  { name: 'Audit Sécurité', client: 'Gamma SA', status: 'Suspendu', statusColor: 'text-accent bg-accent/10', budget: '1.2M' },
                ].map((project, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-5 font-bold text-white group-hover:text-primary transition-colors">{project.name}</td>
                    <td className="px-8 py-5 text-text-muted font-medium">{project.client}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${project.statusColor}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-white">{project.budget} FCFA</td>
                  </tr>
                ))}
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
            {[
              { title: 'Acompte Proposé - ITA', date: '22 Mars 2026', amount: '250.000 FCFA', priority: 'high' },
              { title: 'Solde Projet SEO', date: '25 Mars 2026', amount: '500.000 FCFA', priority: 'medium' },
              { title: 'Lancement App V3', date: '01 Avril 2026', amount: '1.200.000 FCFA', priority: 'low' },
            ].map((item, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
