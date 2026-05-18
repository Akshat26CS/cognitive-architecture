import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import { awardXP } from '../lib/gameState';

// 8 pairs using beautiful generated images
const CARD_DATA = [
  { id: 1, image: '/cards/brain.png', label: 'Frontal Lobe', color: '#8b5cf6' },
  { id: 2, image: '/cards/eye.png', label: 'Visual Cortex', color: '#14b8a6' },
  { id: 3, image: '/cards/heart.png', label: 'Amygdala', color: '#f43f5e' },
  { id: 4, image: '/cards/dna.png', label: 'Hippocampus', color: '#3b82f6' },
  { id: 5, image: '/cards/cerebellum.png', label: 'Cerebellum', color: '#e879f9' },
  { id: 6, image: '/cards/ear.png', label: 'Temporal Lobe', color: '#06b6d4' },
  { id: 7, image: '/cards/hand.png', label: 'Parietal Lobe', color: '#22c55e' },
  { id: 8, image: '/cards/spine.png', label: 'Brain Stem', color: '#fb923c' },
];

interface Card {
  uid: string;
  id: number;
  image: string;
  label: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const SynapticPairs = ({ onQuit }: { onQuit?: () => void }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGame = useCallback(() => {
    // Create pairs (each card appears twice)
    const pairs = CARD_DATA.flatMap(card => [
      { ...card, uid: Math.random().toString(36).substr(2, 9), isFlipped: false, isMatched: false },
      { ...card, uid: Math.random().toString(36).substr(2, 9), isFlipped: false, isMatched: false },
    ]);
    // Shuffle
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsPlaying(true);
    setGameWon(false);
    setGameLost(false);
    setTimeRemaining(90);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameLost(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleCardClick = (index: number) => {
    if (!isPlaying || cards[index].isMatched || cards[index].isFlipped || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;

      if (newCards[a].id === newCards[b].id) {
        // Match!
        setTimeout(() => {
          const matched = [...newCards];
          matched[a].isMatched = true;
          matched[b].isMatched = true;
          setCards(matched);
          setFlippedIndices([]);
          const newMatches = matches + 1;
          setMatches(newMatches);
          if (newMatches === CARD_DATA.length) {
            setIsPlaying(false);
            setGameWon(true);
            if (timerRef.current) clearInterval(timerRef.current);
            // Award XP based on remaining time and moves
            const xp = 50 + (timeRemaining * 2) - (moves * 0.5);
            awardXP(Math.max(10, Math.floor(xp)), 'spatialReasoning');
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const reset = [...newCards];
          reset[a].isFlipped = false;
          reset[b].isFlipped = false;
          setCards(reset);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // ─── Start Screen ───
  if (cards.length === 0) {
    return (
      <div className="w-full max-w-4xl px-6 flex flex-col items-center">
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest mb-8 text-center max-w-md">
          Flip the cards and match pairs of beautiful brain illustrations. Find all 8 pairs before time runs out!
        </p>
        <button
          onClick={initializeGame}
          className="group relative px-10 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-teal-500/30"
          style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.1))' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(6,182,212,0.2))' }} />
          <span className="relative z-10 font-mono text-sm tracking-widest uppercase text-teal-300">⚡ Start Game</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-4 md:px-6 flex flex-col items-center">
      <style>{`
        .card-perspective { perspective: 800px; }
        .card-inner { transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-front, .card-back { backface-visibility: hidden; }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 md:gap-10 mb-8 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono text-white/40 tracking-widest">Time</span>
          <span className={cn("text-lg font-mono font-bold", timeRemaining < 15 ? "text-rose-500 animate-pulse" : "text-white")}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono text-white/40 tracking-widest">Pairs</span>
          <span className="text-lg font-mono font-bold text-teal-400">{matches}/{CARD_DATA.length}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-mono text-white/40 tracking-widest">Moves</span>
          <span className="text-lg font-mono font-bold text-white/80">{moves}</span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-4 gap-2.5 md:gap-4 w-full max-w-2xl">
        {cards.map((card, index) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.uid}
              className="card-perspective aspect-[3/4] cursor-pointer"
              onClick={() => handleCardClick(index)}
            >
              <div className={cn("card-inner relative w-full h-full", isRevealed && "flipped")}>
                {/* Front (face down) */}
                <div className="card-front absolute inset-0 rounded-xl md:rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(20,15,30,0.95), rgba(10,8,20,0.98))' }}
                >
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id={`grid-${index}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="#8b5cf6" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#grid-${index})`} />
                    </svg>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-violet-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-violet-500/40" />
                    </div>
                    <span className="font-mono text-[7px] md:text-[8px] text-violet-500/40 uppercase tracking-widest">Neural</span>
                  </div>
                </div>

                {/* Back (face up — shows beautiful image) */}
                <div className="card-back absolute inset-0 rounded-xl md:rounded-2xl overflow-hidden border-2"
                  style={{
                    borderColor: card.isMatched ? card.color : 'rgba(255,255,255,0.2)',
                    boxShadow: card.isMatched ? `0 0 25px ${card.color}40, inset 0 0 15px ${card.color}15` : '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  {/* Full card image */}
                  <img
                    src={card.image}
                    alt={card.label}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: card.isMatched ? 'brightness(1.1) saturate(1.2)' : 'brightness(0.85)' }}
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
                  
                  {/* Label at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 text-center">
                    <span
                      className="font-mono text-[9px] md:text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: card.color, textShadow: `0 0 10px ${card.color}60` }}
                    >
                      {card.label}
                    </span>
                  </div>

                  {/* Match glow overlay */}
                  {card.isMatched && (
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl" style={{ background: `radial-gradient(circle, ${card.color}20, transparent)` }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win/Lose Modal */}
      {(gameWon || gameLost) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/20 rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl">
            {gameWon ? (
              <>
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-light uppercase tracking-widest text-teal-400 mb-2">All Pairs Found!</h3>
                <p className="text-white/50 font-mono text-sm mb-6">Completed in {moves} moves with {timeRemaining}s remaining.</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⏰</div>
                <h3 className="text-2xl font-light uppercase tracking-widest text-rose-500 mb-2">Time Expired</h3>
                <p className="text-white/50 font-mono text-sm mb-6">Found {matches}/{CARD_DATA.length} pairs.</p>
              </>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={initializeGame}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-sm uppercase tracking-widest transition-colors"
              >
                {gameWon ? 'Play Again' : 'Retry'}
              </button>
              {onQuit && (
                <button
                  onClick={onQuit}
                  className="px-8 py-3 rounded-xl bg-transparent hover:bg-white/10 border border-white/10 font-mono text-sm uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Quit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
