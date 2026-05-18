import React, { useState } from 'react';
import { MemoryGame } from './MemoryGame';
import { SynapticPairs } from './SynapticPairs';

const GAMES = [
  {
    id: 'sequence',
    title: 'Neural Sequence',
    subtitle: 'Pattern Memory',
    icon: '⚡',
    color: '#8b5cf6',
    description: 'Observe and replicate neural firing patterns across escalating difficulty levels.',
  },
  {
    id: 'pairs',
    title: 'Synaptic Pairs',
    subtitle: 'Visual Memory',
    icon: '🧩',
    color: '#14b8a6',
    description: 'Flip cards and match beautiful brain illustrations before time runs out.',
  },
];

export const MiniGames = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <section
        className="relative min-h-screen flex flex-col items-center justify-center py-20 md:py-28 z-20 pointer-events-auto overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0618 30%, #0f0a24 60%, #0a0618 85%, #050505 100%)' }}
      >
        {/* Ambient background */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10" style={{ backgroundColor: '#8b5cf6' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] opacity-8" style={{ backgroundColor: '#14b8a6' }} />
        </div>

        {/* Section Header */}
        {!activeGame && (
          <div className="relative z-10 text-center mb-16 px-6">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-px" style={{ background: 'linear-gradient(to right, transparent, #8b5cf6)' }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-violet-400">Cognitive Laboratory</span>
              <div className="w-12 h-px" style={{ background: 'linear-gradient(to left, transparent, #8b5cf6)' }} />
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter uppercase mb-5">
              <span className="text-white">Mini </span>
              <span className="text-transparent bg-clip-text font-semibold" style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #14b8a6, #f59e0b)' }}>
                Games
              </span>
            </h2>
            <p className="text-white/35 font-mono text-xs md:text-sm max-w-xl mx-auto leading-relaxed uppercase tracking-wider">
              Test your cognitive abilities with neuroscience-themed challenges. Choose your experiment below.
            </p>
          </div>
        )}

        {/* Game Selection Cards */}
        {!activeGame && (
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 px-6 max-w-3xl w-full">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className="group relative flex-1 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl text-left"
                style={{
                  background: `linear-gradient(160deg, ${game.color}12, ${game.color}06, rgba(10,10,10,0.8))`,
                  border: `1px solid ${game.color}20`,
                }}
              >
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `linear-gradient(160deg, ${game.color}18, transparent 60%)` }}
                />

                <div className="relative z-10 p-8 md:p-10 flex flex-col min-h-[260px]">
                  {/* Icon */}
                  <div
                    className="text-4xl mb-6"
                    style={{ animation: 'floatSlow 3s ease-in-out infinite' }}
                  >
                    {game.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    {game.title}
                  </h3>
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider mb-5 block"
                    style={{ color: `${game.color}90` }}
                  >
                    {game.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-white/45 text-sm leading-relaxed mb-8 flex-grow">
                    {game.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs uppercase tracking-widest transition-colors duration-300"
                      style={{ color: game.color }}
                    >
                      Launch
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={game.color} strokeWidth="2" className="group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back Button */}
        {activeGame && (
          <div className="relative z-10 w-full max-w-5xl px-6 mb-8">
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="font-mono text-xs uppercase tracking-widest">Back to Games</span>
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
