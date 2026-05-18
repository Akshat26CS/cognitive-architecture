import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

// The cognitive pairs (Brain Region -> Function/Icon)
const PAIR_DATA = [
  { id: 1, type: 'text', content: 'Frontal Lobe', pairId: 'frontal', color: '#f59e0b' },
  { id: 2, type: 'icon', content: '🧠 Executive', pairId: 'frontal', color: '#f59e0b' },
  
  { id: 3, type: 'text', content: 'Occipital Lobe', pairId: 'occipital', color: '#14b8a6' },
  { id: 4, type: 'icon', content: '👁️ Vision', pairId: 'occipital', color: '#14b8a6' },
  
  { id: 5, type: 'text', content: 'Amygdala', pairId: 'amygdala', color: '#f43f5e' },
  { id: 6, type: 'icon', content: '❤️‍🔥 Emotion', pairId: 'amygdala', color: '#f43f5e' },
  
  { id: 7, type: 'text', content: 'Hippocampus', pairId: 'hippocampus', color: '#8b5cf6' },
  { id: 8, type: 'icon', content: '💾 Memory', pairId: 'hippocampus', color: '#8b5cf6' },
  
  { id: 9, type: 'text', content: 'Cerebellum', pairId: 'cerebellum', color: '#e879f9' },
  { id: 10, type: 'icon', content: '⚖️ Balance', pairId: 'cerebellum', color: '#e879f9' },
  
  { id: 11, type: 'text', content: 'Temporal Lobe', pairId: 'temporal', color: '#3b82f6' },
  { id: 12, type: 'icon', content: '👂 Hearing', pairId: 'temporal', color: '#3b82f6' },
  
  { id: 13, type: 'text', content: 'Parietal Lobe', pairId: 'parietal', color: '#22c55e' },
  { id: 14, type: 'icon', content: '🖐️ Touch', pairId: 'parietal', color: '#22c55e' },
  
  { id: 15, type: 'text', content: 'Brain Stem', pairId: 'brainstem', color: '#fb923c' },
  { id: 16, type: 'icon', content: '🫁 Autonomic', pairId: 'brainstem', color: '#fb923c' },
];

interface Card {
  uid: string;
  id: number;
  type: string;
  content: string;
  pairId: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const SynapticPairs = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
  const [shuffleWarning, setShuffleWarning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize deck
  const initializeGame = useCallback(() => {
    // Shuffle the cards
    const shuffled = [...PAIR_DATA]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({
        ...card,
        uid: Math.random().toString(36).substr(2, 9),
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsPlaying(true);
    setTimeRemaining(90); // 90 seconds to solve
    setShuffleWarning(false);

    if (timerRef.current) clearInterval(timerRef.current);
    if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);

    // Global countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Neuroplasticity twist: Shuffle unmatched cards every 20 seconds
    startShuffleTimer();
  }, []);

  const startShuffleTimer = () => {
    if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);
    
    // Warning at 15s, shuffle at 18s
    shuffleTimerRef.current = setInterval(() => {
       setShuffleWarning(true);
       setTimeout(() => {
         setShuffleWarning(false);
         // Perform Shuffle
         setCards(prevCards => {
           const matched = prevCards.filter(c => c.isMatched);
           const unmatched = prevCards.filter(c => !c.isMatched).sort(() => Math.random() - 0.5);
           
           // Recombine, maintaining matched positions if possible, or just complete re-layout
           // Let's just do a complete re-layout for simplicity
           return [...prevCards].map(c => {
             if (c.isMatched) return c;
             return unmatched.pop()!;
           });
         });
         setFlippedIndices([]);
       }, 3000);
    }, 20000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);
    };
  }, []);

  const handleCardClick = (index: number) => {
    if (!isPlaying || cards[index].isMatched || cards[index].isFlipped) return;
    if (flippedIndices.length === 2) return; // Prevent clicking more than 2 quickly

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(m => m + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          
          if (matches + 1 === PAIR_DATA.length / 2) {
             // Win condition
             setIsPlaying(false);
             if (timerRef.current) clearInterval(timerRef.current);
             if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <>
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <section className="relative min-h-screen flex flex-col items-center justify-center py-24 z-20 pointer-events-auto overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #050505 0%, #080515 40%, #050505 100%)' }}
      >
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.05]" style={{ backgroundColor: '#14b8a6' }} />
          <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.04]" style={{ backgroundColor: '#f43f5e' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 max-w-5xl w-full px-6 flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-teal-400">Synaptic Pairing Mode</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter pb-1 mb-4">
            <span className="text-white">Cognitive </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 font-semibold">Connections</span>
          </h2>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest max-w-lg leading-relaxed">
            Match the brain region to its cognitive function. Act fast — unmatched neural pathways will undergo neuroplastic reorganization (shuffle) if idle.
          </p>
        </div>

        {/* Game Stats */}
        {cards.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-6 md:gap-12 mb-8 bg-white/5 border border-white/10 px-8 py-4 rounded-full backdrop-blur-md">
            <div className="flex flex-col items-center">
               <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Time</span>
               <span className={cn("text-xl font-mono font-bold", timeRemaining < 15 ? "text-rose-500 animate-pulse" : "text-white")}>
                 {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
               </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
               <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Matches</span>
               <span className="text-xl font-mono font-bold text-teal-400">
                 {matches} / {PAIR_DATA.length / 2}
               </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
               <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Moves</span>
               <span className="text-xl font-mono font-bold text-white/80">{moves}</span>
            </div>
          </div>
        )}

        {/* Warning Toast */}
        <div className={cn(
          "relative z-20 mb-4 px-6 py-2 rounded-full border border-amber-500/50 bg-amber-500/10 backdrop-blur-md transition-all duration-300",
          shuffleWarning ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
           <span className="font-mono text-xs text-amber-400 uppercase tracking-widest animate-pulse">
             ⚠️ Neuroplastic Reorganization Imminent ⚠️
           </span>
        </div>

        {/* Game Grid */}
        <div className="relative z-10 w-full max-w-4xl px-4">
          {cards.length === 0 ? (
            <div className="flex justify-center my-20">
              <button
                onClick={initializeGame}
                className="group relative px-10 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 border border-teal-500/30"
                style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.1))' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(6,182,212,0.2))' }}
                />
                <span className="relative z-10 font-mono text-sm tracking-widest uppercase text-teal-300">
                  ⚡ Initialize Synapses
                </span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 md:gap-5 perspective-1000">
              {cards.map((card, index) => (
                <div 
                  key={card.uid} 
                  className={cn(
                    "relative aspect-square md:aspect-[4/3] rounded-xl md:rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d shadow-lg",
                    (card.isFlipped || card.isMatched) ? "rotate-y-180" : "hover:-translate-y-1"
                  )}
                  onClick={() => handleCardClick(index)}
                >
                  {/* Front of card (Hidden Face) */}
                  <div className="absolute inset-0 backface-hidden rounded-xl md:rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(20,20,20,0.8) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Back of card (Revealed Face) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center p-2 text-center"
                    style={{ 
                      background: card.isMatched 
                        ? `linear-gradient(135deg, ${card.color}20, ${card.color}10)`
                        : `linear-gradient(135deg, rgba(40,40,40,0.9), rgba(20,20,20,0.9))`,
                      borderColor: card.isMatched ? card.color : 'rgba(255,255,255,0.2)',
                      boxShadow: card.isMatched ? `0 0 20px ${card.color}30, inset 0 0 10px ${card.color}20` : 'none',
                    }}
                  >
                    {/* Glowing Scanner Line */}
                    {!card.isMatched && card.isFlipped && (
                      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                        <div className="w-full h-1 bg-white/30 blur-[2px]" style={{ animation: 'scanline 2s linear infinite' }} />
                      </div>
                    )}
                    
                    <span 
                      className={cn(
                        "font-bold transition-colors duration-300", 
                        card.type === 'icon' ? "text-2xl md:text-4xl" : "text-[10px] md:text-sm tracking-widest uppercase font-mono"
                      )}
                      style={{ color: card.isMatched ? card.color : '#fff', textShadow: card.isMatched ? `0 0 10px ${card.color}` : 'none' }}
                    >
                      {card.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win/Lose Modals */}
        {(!isPlaying && cards.length > 0) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/20 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
               {matches === PAIR_DATA.length / 2 ? (
                 <>
                   <div className="text-5xl mb-4">🏆</div>
                   <h3 className="text-2xl font-light uppercase tracking-widest text-teal-400 mb-2">Integration Complete</h3>
                   <p className="text-white/60 font-mono text-sm mb-6">All neural pathways established in {moves} moves with {timeRemaining}s remaining.</p>
                 </>
               ) : (
                 <>
                   <div className="text-5xl mb-4">📉</div>
                   <h3 className="text-2xl font-light uppercase tracking-widest text-rose-500 mb-2">Connection Lost</h3>
                   <p className="text-white/60 font-mono text-sm mb-6">Time expired before all pathways could be mapped.</p>
                 </>
               )}
               
               <button
                  onClick={initializeGame}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-sm uppercase tracking-widest transition-colors"
                >
                  {matches === PAIR_DATA.length / 2 ? 'Run Again' : 'Retry'}
                </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
};
