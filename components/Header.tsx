import React from 'react';
import { Search, Bell, User, Settings, Menu } from 'lucide-react';

export default function Header({ 
  title, 
  onMenuClick 
}: { 
  title: string; 
  onMenuClick?: () => void;
}) {
  return (
    <header className="h-[var(--header-height)] w-full glass border-x-0 border-t-0 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-40 backdrop-blur-xl bg-background/40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/5 text-text-muted hover:text-white transition-all"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-premium text-gradient truncate max-w-[200px] sm:max-w-none">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Search */}
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher une transaction..." 
            className="pl-11 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-sm w-80 text-white placeholder:text-text-muted/60"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <button className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white relative transition-all border border-white/5">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background glow-primary"></span>
            </button>
            <button className="hidden sm:flex p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/5">
              <Settings size={18} />
            </button>
          </div>
          
          <div className="h-6 w-[1px] bg-white/10 mx-1 sm:mx-2 hidden sm:block"></div>
          
          <button className="flex items-center gap-3 p-1 rounded-2xl sm:p-1.5 sm:pr-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
              ITA
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-white">ITA INNOVATE</span>
              <span className="text-[10px] text-text-muted uppercase tracking-tighter font-bold">Administrateur</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
