'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Mapping paths to titles
  const titles: Record<string, string> = {
    '/': 'Tableau de bord',
    '/clients': 'Gestion des Clients',
    '/projets': 'Gestion des Projets',
    '/paiements': 'Paiements & Recettes',
    '/echeanciers': 'Échéanciers de Paiement',
    '/depenses': 'Gestion des Dépenses',
    '/rapports': 'Rapports Financiers',
    '/login': 'Connexion',
  };

  const title = titles[pathname] || 'ITA Finance Manager';
  const isLoginPage = pathname === '/login';

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background text-text overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 60, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-24 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 left-1/3 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" 
        />
      </div>

      <Sidebar />
      <main className="flex-1 transition-all duration-300 min-h-screen flex flex-col relative z-10 pl-[280px]">
        <Header title={title} />
        <div className="p-10 pb-20 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
