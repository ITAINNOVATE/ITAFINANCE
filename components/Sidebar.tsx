'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  CreditCard, 
  Calendar, 
  TrendingDown, 
  FileText, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Tableau de bord', icon: BarChart3, path: '/' },
  { name: 'Clients', icon: Users, path: '/clients' },
  { name: 'Projets', icon: Briefcase, path: '/projets' },
  { name: 'Paiements', icon: CreditCard, path: '/paiements' },
  { name: 'Échéanciers', icon: Calendar, path: '/echeanciers' },
  { name: 'Dépenses', icon: TrendingDown, path: '/depenses' },
  { name: 'Rapports', icon: FileText, path: '/rapports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen fixed left-0 top-0 glass border-y-0 border-l-0 z-50 flex flex-col bg-background/20 backdrop-blur-2xl"
    >
      {/* Logo Section */}
      <div className="p-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-2xl font-bold text-white tracking-widest text-gradient">ITA</h1>
            <p className="text-[9px] text-primary font-bold uppercase tracking-[0.3em] mt-1">Finance Manager</p>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 glow-primary" 
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={isCollapsed ? 24 : 18} className={cn(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
              {!isCollapsed && (
                <span className={cn("font-bold text-sm tracking-tight transition-all", isActive ? "translate-x-0" : "group-hover:translate-x-1")}>
                  {item.name}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-6 border-t border-white/5 space-y-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-inner">
              AD
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-sm font-bold text-white truncate">Admin ITA</span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-secondary" />
                <span className="text-[10px] text-text-muted font-bold truncate">Vérifié</span>
              </div>
            </div>
          </div>
        )}
        
        <button className={cn(
          "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm",
          isCollapsed ? "justify-center" : ""
        )}>
          <LogOut size={18} />
          {!isCollapsed && <span className="">Déconnexion</span>}
        </button>
      </div>
    </motion.div>
  );
}
