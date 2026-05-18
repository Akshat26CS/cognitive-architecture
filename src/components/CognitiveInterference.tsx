import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../lib/utils';
import { awardXP } from '../lib/gameState';

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' }
];

export const CognitiveInterference = ({ onQuit }: { onQuit?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  
  const [wordText, setWordText] = useState(COLORS[0]);
  const [wordColor, setWordColor] = useState(COLORS[1]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = useCallback(() => {
    // 50% chance the text and color match (makes it trickier)
    const isMatch = Math.random() > 0.5;
    const textIdx = Math.floor(Math.random() * COLORS.length);
    
    setWordText(COLORS[textIdx]);
    
    if (isMatch) {
      setWordColor(COLORS[textIdx]);
    } else {
      let colorIdx = Math.floor(Math.random() * COLORS.length);
      while (colorIdx === textIdx) {
        colorIdx = Math.floor(Math.random() * COLORS.length);
      }
      setWordColor(COLORS[colorIdx]);
    }
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setGameOver(false);
    generateRound();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameOver(true);
          setIsPlaying(false);
          // Award XP based on latest score
          awardXP(scoreRef.current * 2, 'processingSpeed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnswer = (colorHex: string) => {
    if (!isPlaying || gameOver) return;

    if (colorHex === wordColor.hex) {
      setScore(s => { const newScore = s + 10; scoreRef.current = newScore; return newScore; });
      generateRound();
    } else {
      setScore(s => { const newScore = Math.max(0, s - 5); scoreRef.current = newScore; return newScore; });
      // Penalty visual effect
      const wrap = document.getElementById('stroop-wrapper');
      if (wrap) {
        wrap.classList.add('bg-red-500/20');
        setTimeout(() => wrap.classList.remove('bg-red-500/20'), 200);
      }
    }
  };

  if (!isPlaying && !gameOver) {
    return (
      <div className="relative z-20 pointer-events-auto w-full max-w-2xl px-6 py-12 flex flex-col items-center text-center bg-[#0a0514] border border-rose-500/20 rounded-3xl shadow-[0_0_30px_rgba(244,63,94,0.1)]">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 text-2xl mb-6">
          ⚡
        </div>
        <h2 className="text-3xl font-black tracking-tight uppercase mb-4 text-white">Cognitive <span className="text-rose-500">Interference</span></h2>
        <p className="text-white/40 font-mono text-sm leading-relaxed mb-8 max-w-md">
          A high-speed Stroop Test. Select the button that matches the <strong className="text-white">INK COLOR</strong> of the word, ignoring what the word says.
        </p>
        
        <div className="flex gap-4">
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-rose-500 text-white font-bold tracking-widest uppercase hover:bg-rose-400 transition-colors shadow-[0_0_20px_rgba(244,63,94,0.4)]">
            Start Protocol
          </button>
          {onQuit && (
             <button onClick={onQuit} className="px-8 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 font-bold tracking-widest uppercase transition-colors">
               Back
             </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="stroop-wrapper" className="relative z-20 pointer-events-auto w-full max-w-3xl px-4 flex flex-col items-center transition-colors duration-200">
      
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-12 px-6 py-4 bg-black/50 rounded-2xl border border-white/10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Time</span>
          <span className={cn("text-2xl font-mono font-bold", timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-white")}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        
        {onQuit && (
          <button onClick={() => { if(timerRef.current) clearInterval(timerRef.current); onQuit(); }} className="text-[10px] uppercase font-mono text-white/30 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
            Quit
          </button>
        )}

        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Score</span>
          <span className="text-2xl font-mono font-bold text-cyan-400">{score}</span>
        </div>
      </div>

      {/* Main Game Area */}
      {isPlaying ? (
        <div className="flex flex-col items-center w-full">
          <div className="mb-16 h-32 flex items-center justify-center">
            <span 
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter"
              style={{ color: wordColor.hex, textShadow: `0 0 40px ${wordColor.hex}60` }}
            >
              {wordText.name}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-4 w-full">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => handleAnswer(c.hex)}
                className="aspect-square rounded-2xl border-2 transition-transform active:scale-90"
                style={{ borderColor: c.hex, background: `${c.hex}20`, boxShadow: `0 0 15px ${c.hex}40` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center bg-[#0a0514] border border-rose-500/20 rounded-3xl p-10 w-full">
          <h3 className="text-3xl font-light uppercase tracking-widest text-white mb-2">Protocol <span className="text-rose-500 font-bold">Ended</span></h3>
          <p className="text-white/50 font-mono mb-8">Final Score: <span className="text-cyan-400 font-bold text-xl">{score}</span></p>
          
          <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl mb-8 w-full max-w-sm">
            <p className="text-xs text-violet-300 font-mono uppercase tracking-widest mb-1">+ {score * 2} XP Earned</p>
            <p className="text-[10px] text-white/40">Processing Speed increased.</p>
          </div>

          <div className="flex gap-4">
            <button onClick={startGame} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-sm uppercase tracking-widest transition-colors">
              Play Again
            </button>
            {onQuit && (
               <button onClick={onQuit} className="px-8 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 font-mono text-sm uppercase tracking-widest transition-colors">
                 Exit
               </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
