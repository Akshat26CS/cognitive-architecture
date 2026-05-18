import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { getGameState } from '../lib/gameState';

export const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(getGameState());

  React.useEffect(() => {
    const handleUpdate = () => setStats(getGameState());
    window.addEventListener('cog_state_updated', handleUpdate);
    return () => window.removeEventListener('cog_state_updated', handleUpdate);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 pl-2 pr-4 py-2 rounded-full hover:bg-white/5 transition-all shadow-lg group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
          U
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-mono text-white/50 tracking-widest leading-none">Profile</span>
          <span className="text-xs font-bold text-white leading-none mt-1">LVL {stats.level}</span>
        </div>
      </button>

      {isOpen && <Dashboard onClose={() => setIsOpen(false)} />}
    </>
  );
};
