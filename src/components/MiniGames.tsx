import React, { useState } from 'react';
import { MemoryGame } from './MemoryGame';
import { SynapticPairs } from './SynapticPairs';

const GAMES = [
  { id: 'sequence', title: 'Neural Sequence', subtitle: '80 Stages · 8 Worlds', icon: '⚡', color: '#8b5cf6', gradient: 'from-violet-600 to-indigo-800', desc: 'Master escalating pattern recognition across 8 cognitive worlds, each with 10 stages of increasing difficulty.' },
  { id: 'pairs', title: 'Synaptic Pairs', subtitle: 'Visual Memory', icon: '🧩', color: '#14b8a6', gradient: 'from-teal-600 to-emerald-800', desc: 'Flip stunning brain illustrations and match pairs before neural pathways expire.' },
];

export const MiniGames = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes gridPulse { 0%,100%{opacity:.03} 50%{opacity:.06} }
        @keyframes scanDown { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
        @keyframes glowOrbit { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>

      <section className="relative min-h-screen flex flex-col items-center justify-center py-20 md:py-28 z-20 pointer-events-auto overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #050505 0%, #08051a 25%, #0d0824 50%, #08051a 75%, #050505 100%)' }}
      >
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ animation: 'gridPulse 4s ease-in-out infinite' }}>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mg-grid)" />
          </svg>
        </div>

        {/* Ambient glows */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.06]" style={{ backgroundColor: '#8b5cf6' }} />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.05]" style={{ backgroundColor: '#14b8a6' }} />

        {/* Section Header */}
        {!activeGame && (
          <div className="relative z-10 text-center mb-14 px-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.5))' }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-violet-400/70">Neural Training Facility</span>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(139,92,246,0.5))' }} />
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 leading-none">
              <span className="text-white">MINI </span>
              <span className="text-transparent bg-clip-text font-black" style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #f59e0b)' }}>GAMES</span>
            </h2>

            <p className="text-white/30 font-mono text-[10px] md:text-xs max-w-lg mx-auto leading-relaxed uppercase tracking-[0.2em]">
              Select your cognitive experiment. Complete all stages to unlock the next tier.
            </p>
          </div>
        )}

        {/* Game Cards */}
        {!activeGame && (
          <div className="relative z-10 flex flex-col md:flex-row gap-5 md:gap-8 px-6 max-w-4xl w-full">
            {GAMES.map((game) => (
              <button key={game.id} onClick={() => setActiveGame(game.id)}
                className="group relative flex-1 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-3 text-left"
                style={{ border: `1px solid ${game.color}20` }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse at 30% 20%, ${game.color}, transparent 70%)` }}
                />

                {/* Scan line effect */}
                <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="w-full h-px bg-white/10" style={{ animation: 'scanDown 3s linear infinite' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 flex flex-col min-h-[300px]" style={{ background: 'linear-gradient(160deg, rgba(15,12,25,0.8), rgba(5,3,10,0.95))' }}>
                  {/* Top tag */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: game.color, boxShadow: `0 0 8px ${game.color}` }} />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: `${game.color}99` }}>{game.subtitle}</span>
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-5">{game.icon}</div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3 uppercase">{game.title}</h3>

                  <p className="text-white/35 text-xs leading-relaxed mb-auto">{game.desc}</p>

                  {/* CTA */}
                  <div className="mt-6 flex items-center gap-2 group-hover:gap-3 transition-all">
                    <span className="font-mono text-[11px] uppercase tracking-[0.25em] font-bold" style={{ color: game.color }}>LAUNCH</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={game.color} strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button */}
        {activeGame && (
          <div className="relative z-10 w-full max-w-5xl px-6 mb-6">
            <button onClick={() => setActiveGame(null)} className="flex items-center gap-2 text-white/35 hover:text-white transition-colors group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Game Select</span>
            </button>
          </div>
        )}

        {/* Active Game */}
        {activeGame === 'sequence' && <MemoryGame />}
        {activeGame === 'pairs' && <SynapticPairs />}
      </section>
    </>
  );
};
