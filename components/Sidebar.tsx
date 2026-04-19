'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
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
  ShieldCheck,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { id: 'dashboard', name: 'Tableau de bord', icon: BarChart3, path: '/' },
  { id: 'clients', name: 'Clients', icon: Users, path: '/clients' },
  { id: 'projets', name: 'Projets', icon: Briefcase, path: '/projets' },
  { id: 'paiements', name: 'Paiements', icon: CreditCard, path: '/paiements' },
  { id: 'echeanciers', name: 'Échéanciers', icon: Calendar, path: '/echeanciers' },
  { id: 'depenses', name: 'Dépenses', icon: TrendingDown, path: '/depenses' },
  { id: 'rapports', name: 'Rapports', icon: FileText, path: '/rapports' },
  { id: 'admin', name: 'Administration', icon: ShieldCheck, path: '/admin' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { profile, signOut } = useAuth();

  const filteredItems = menuItems.filter(item => {
    if (item.id === 'dashboard') return true;
    // Super admin always sees everything
    if (profile?.email === 'groupita25@gmail.com') return true;
    if (!profile) return false;
    // Admin role sees everything
    if (profile.role === 'admin') return true;
    // Specific permissions for users
    return profile.permissions?.includes(item.id);
  });

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 280,
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "h-screen fixed left-0 top-0 glass border-y-0 border-l-0 z-50 flex flex-col bg-background/20 backdrop-blur-2xl transition-transform lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button 
              onClick={onClose}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs text-white font-bold shadow-inner">
                {profile?.email?.substring(0, 2).toUpperCase() || 'IT'}
              </div>
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-[11px] font-bold text-white truncate">{profile?.email || 'Utilisateur'}</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck size={10} className={profile?.role === 'admin' ? "text-secondary" : "text-text-muted"} />
                  <span className="text-[9px] text-text-muted font-bold truncate uppercase tracking-tighter">
                    {profile?.role === 'admin' ? 'Administrateur' : 'Collaborateur'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => signOut()}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="">Déconnexion</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
}
