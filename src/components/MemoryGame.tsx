import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

const GRID_SIZE = 9;

// Brain-themed colors for each node
const NODE_COLORS = [
  { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', name: 'Prefrontal' },
  { bg: '#06b6d4', glow: 'rgba(6,182,212,0.6)', name: 'Motor' },
  { bg: '#f59e0b', glow: 'rgba(245,158,11,0.6)', name: 'Sensory' },
  { bg: '#ec4899', glow: 'rgba(236,72,153,0.6)', name: 'Temporal' },
  { bg: '#10b981', glow: 'rgba(16,185,129,0.6)', name: 'Parietal' },
  { bg: '#f43f5e', glow: 'rgba(244,63,94,0.6)', name: 'Occipital' },
  { bg: '#3b82f6', glow: 'rgba(59,130,246,0.6)', name: 'Limbic' },
  { bg: '#a855f7', glow: 'rgba(168,85,247,0.6)', name: 'Cerebellum' },
  { bg: '#14b8a6', glow: 'rgba(20,184,166,0.6)', name: 'Brain Stem' },
];

// Neural connection lines between nodes (for visual decoration)
const NEURAL_CONNECTIONS = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],
  [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8],
  [0, 4], [4, 8], [2, 4], [4, 6],
];

export const MemoryGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [level, setLevel] = useState(1);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [distractionNode, setDistractionNode] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [highScore, setHighScore] = useState(1);
  
  // Modifiers
  const [isReverseMode, setIsReverseMode] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cognitive_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startLevel = useCallback((currentLevel: number) => {
    setIsPlaying(true);
    setPlayerSequence([]);
    setFailed(false);
    setSuccess(false);
    setIsShowingSequence(true);
    
    // Set modifiers based on level
    setIsReverseMode(currentLevel >= 10);
    setIsRotated(false);
    setTimeLeft(100);
    if (timerRef.current) clearInterval(timerRef.current);

    const newSequence = Array.from({ length: currentLevel + 2 }, () => Math.floor(Math.random() * GRID_SIZE));
    setSequence(newSequence);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsShowingSequence(false);
        
        // Spatial Disruption: Rotate grid after showing sequence (Level 7+)
        if (currentLevel >= 7) {
          setIsRotated(true);
        }

        // Time Decay (Level 5+)
        if (currentLevel >= 5) {
          const duration = Math.max(5000, 12000 - (currentLevel * 500)); // 12s scaling down to 5s
          const interval = 50;
          const decreaseAmount = (interval / duration) * 100;
          
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                setFailed(true);
                setIsPlaying(false);
                return 0;
              }
              return prev - decreaseAmount;
            });
          }, interval);
        }
      }
    });

    tl.to({}, { duration: 0.8 });

    newSequence.forEach((nodeIndex) => {
      // Add Sensory Distractions (Level 3+)
      const addDistraction = currentLevel >= 3 && Math.random() > 0.6;
      let distNode = -1;
      if (addDistraction) {
        distNode = Math.floor(Math.random() * GRID_SIZE);
        while (distNode === nodeIndex) distNode = Math.floor(Math.random() * GRID_SIZE);
      }

      tl.call(() => setActiveNode(nodeIndex))
        .call(() => { if(addDistraction) setDistractionNode(distNode); })
        .to({}, { duration: Math.max(0.2, 0.8 - (currentLevel * 0.05)) })
        .call(() => { setActiveNode(null); setDistractionNode(null); })
        .to({}, { duration: 0.15 });
    });
  }, []);

  const handleNodeClick = (index: number) => {
    if (!isPlaying || isShowingSequence || failed || success) return;

    const domNode = document.getElementById(`node-${index}`);
    if (domNode) {
      domNode.style.willChange = 'transform';
      gsap.fromTo(domNode,
        { scale: 0.85 },
        { scale: 1, duration: 0.35, ease: 'back.out(3)' }
      );
    }

    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;
    
    // Check correctness based on reverse mode modifier
    const targetIndex = isReverseMode ? sequence.length - 1 - currentIndex : currentIndex;
    
    if (sequence[targetIndex] !== index) {
      if (timerRef.current) clearInterval(timerRef.current);
      setFailed(true);
      setIsPlaying(false);
      
      // Reset rotation on fail
      setIsRotated(false);
      
      gsap.to(containerRef.current, { x: 8, yoyo: true, repeat: 5, duration: 0.06, ease: 'power2.inOut' });
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSuccess(true);
      
      if (level + 1 > highScore) {
        setHighScore(level + 1);
        localStorage.setItem('cognitive_highscore', (level + 1).toString());
      }
      
      setTimeout(() => {
        setIsRotated(false); // Reset rotation before next level
        setTimeout(() => {
          setLevel(l => l + 1);
          startLevel(level + 1);
        }, 500); // Give time for un-rotation animation
      }, 1000);
    }
  };

  const progressRatio = isPlaying && !isShowingSequence
    ? playerSequence.length / sequence.length
    : isShowingSequence ? 0 : 0;

  // Determine the active modifier text
  const getModifierText = () => {
    if (isShowingSequence) return 'Observe the neural firing pattern.';
    if (isReverseMode) return 'REVERSE MODE: Input the sequence backward.';
    if (isRotated) return 'SPATIAL DISRUPTION: Grid rotated.';
    if (level >= 5) return 'TIME DECAY: Input before signal drops.';
    return 'Replicate the signal path perfectly.';
  };

  return (
    <>
      <style>{`
        @keyframes neuralPulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.18; }
        }
        @keyframes brainWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes nodeIdle {
          0%, 100% { box-shadow: 0 0 0px transparent; }
          50% { box-shadow: 0 0 12px var(--node-glow); }
        }
        @keyframes glitchFlash {
          0%, 100% { opacity: 1; filter: hue-rotate(0deg); }
          50% { opacity: 0.8; filter: hue-rotate(90deg) contrast(150%); }
        }
      `}</style>

      <section className="relative min-h-screen flex flex-col items-center justify-center py-24 z-20 pointer-events-auto overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0618 30%, #0f0a24 60%, #0a0618 85%, #050505 100%)' }}
      >
        {/* Decorative brain network background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating neural particles - reduced for performance */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: NODE_COLORS[i % 9].bg,
                opacity: 0.15,
                left: `${(i * 17 + 5) % 100}%`,
                top: `${(i * 23 + 10) % 100}%`,
                animation: `neuralPulse ${2 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}

          {/* Ambient gradient orbs — only on desktop */}
          <div className="hidden md:block absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10" style={{ backgroundColor: '#8b5cf6' }} />
          <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] opacity-8" style={{ backgroundColor: '#06b6d4' }} />
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.06]" style={{ backgroundColor: '#f59e0b' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 max-w-4xl w-full px-6 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isReverseMode ? "bg-rose-500" : "bg-violet-500")} />
              <span className={cn("font-mono text-[10px] uppercase tracking-[0.3em]", isReverseMode ? "text-rose-400" : "text-violet-400")}>
                {isReverseMode ? 'CRITICAL OVERLOAD' : 'Neural Interface Active'}
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter pb-1">
              <span className="text-white">Cognitive </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-amber-400 font-semibold">Test</span>
            </h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest mt-3 max-w-md leading-relaxed">
              {getModifierText()}
            </p>
          </div>

          <div className="mt-8 md:mt-0 text-right flex flex-col items-end gap-1">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">Synaptic Level</div>
            <div className="text-6xl font-bold font-mono tracking-tighter leading-none text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #f59e0b)' }}
            >
              {level.toString().padStart(2, '0')}
            </div>
            <div className="font-mono text-[10px] tracking-wider text-white/20 mt-1">
              Best: {highScore.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress & Time bars */}
        <div className="relative z-10 max-w-md w-full mx-auto px-6 mb-8 flex flex-col gap-3">
          {/* Signal Path Progress */}
          {(isPlaying && !isShowingSequence && !failed) && (
            <div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progressRatio * 100}%`,
                    background: isReverseMode 
                      ? 'linear-gradient(90deg, #f43f5e, #f59e0b)' 
                      : 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="font-mono text-[9px] text-white/20">{playerSequence.length}/{sequence.length}</span>
                <span className="font-mono text-[9px] text-white/20">{isReverseMode ? 'REVERSE PATH' : 'SIGNAL PATH'}</span>
              </div>
            </div>
          )}

          {/* Time Decay Bar (Level 5+) */}
          {(level >= 5 && isPlaying && !isShowingSequence && !failed) && (
            <div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${timeLeft}%`,
                    background: timeLeft > 50 ? '#10b981' : timeLeft > 25 ? '#f59e0b' : '#f43f5e',
                    transition: 'width 0.1s linear, background-color 0.3s ease'
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                 <span className="font-mono text-[9px] text-white/20">{(timeLeft/10).toFixed(1)}s</span>
                 <span className="font-mono text-[9px] text-rose-400/50 animate-pulse">DECAY TIMER</span>
              </div>
            </div>
          )}
        </div>

        {/* Neural Grid */}
        <div className="relative z-10">
          {/* SVG neural connection lines behind the grid */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-1000 ease-in-out" 
            viewBox="0 0 300 300" 
            style={{ 
              opacity: 0.08,
              transform: isRotated ? 'rotate(90deg)' : 'none'
            }}
          >
            {NEURAL_CONNECTIONS.map(([a, b], i) => {
              const ax = (a % 3) * 100 + 50, ay = Math.floor(a / 3) * 100 + 50;
              const bx = (b % 3) * 100 + 50, by = Math.floor(b / 3) * 100 + 50;
              return (
                <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="url(#neural-gradient)" strokeWidth="1" />
              );
            })}
            <defs>
              <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          <div
            ref={containerRef}
            className="grid grid-cols-3 gap-5 md:gap-8 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(10,5,20,0.9) 100%)',
              willChange: 'transform',
              transform: isRotated ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 'rotate(180deg)' : 'rotate(90deg)') : 'none',
              transition: 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
              const nodeColor = NODE_COLORS[i];
              const isActive = activeNode === i;
              const isDistraction = distractionNode === i;
              
              // Determine active styles (Standard vs Distraction)
              const currentBg = isDistraction ? '#f43f5e' : nodeColor.bg;
              const currentGlow = isDistraction ? 'rgba(244,63,94,0.8)' : nodeColor.glow;
              const isVisualActive = isActive || isDistraction;

              return (
                <button
                  key={i}
                  id={`node-${i}`}
                  onClick={() => handleNodeClick(i)}
                  disabled={isShowingSequence || !isPlaying}
                  className={cn(
                    "relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl transition-all duration-300 group",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black",
                    !isPlaying && "opacity-40 cursor-not-allowed",
                    isShowingSequence && "cursor-wait",
                    isPlaying && !isShowingSequence && !failed && "cursor-pointer hover:scale-105 active:scale-95",
                  )}
                  style={{
                    ['--node-glow' as string]: currentGlow,
                    background: isVisualActive
                      ? `radial-gradient(circle at center, ${currentBg}, ${currentBg}88)`
                      : `linear-gradient(135deg, ${nodeColor.bg}15, ${nodeColor.bg}08)`,
                    border: `1px solid ${isVisualActive ? currentBg : `${nodeColor.bg}25`}`,
                    boxShadow: isVisualActive
                      ? `0 0 40px ${currentGlow}, 0 0 80px ${currentGlow}40, inset 0 0 30px ${currentGlow}30`
                      : `0 0 0px transparent`,
                    transform: isVisualActive ? 'scale(1.1)' : undefined,
                    animation: isDistraction 
                       ? 'glitchFlash 0.2s ease-in-out infinite' 
                       : isPlaying && !isVisualActive && !isShowingSequence ? `nodeIdle 3s ease-in-out infinite` : 'none',
                    animationDelay: `${i * 0.2}s`,
                    // Counter-rotate the label inside so it stays upright if grid rotates
                    ['--counter-rot' as string]: isRotated ? (typeof window !== 'undefined' && window.innerWidth < 768 ? '-180deg' : '-90deg') : '0deg',
                  } as React.CSSProperties}
                  aria-label={`Neural Node ${nodeColor.name}`}
                >
                  {/* Inner brain icon / pattern */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                    style={{ transform: `rotate(var(--counter-rot))` }}
                  >
                    <div
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-300"
                      style={{
                        background: isVisualActive
                          ? `radial-gradient(circle, white, ${currentBg})`
                          : `radial-gradient(circle, ${nodeColor.bg}40, transparent)`,
                        boxShadow: isVisualActive ? `0 0 20px ${currentBg}` : 'none',
                      }}
                    />
                  </div>

                  {/* Node label */}
                  <div 
                    className="absolute inset-0 flex items-end justify-center pb-1.5 md:pb-2 transition-transform duration-1000"
                    style={{ transform: `rotate(var(--counter-rot))` }}
                  >
                    <span
                      className="text-center font-mono text-[7px] md:text-[8px] uppercase tracking-wider transition-opacity duration-300 whitespace-nowrap"
                      style={{ color: isVisualActive ? '#fff' : `${nodeColor.bg}60`, opacity: isPlaying ? 1 : 0.3 }}
                    >
                      {isDistraction ? 'ANOMALY' : nodeColor.name}
                    </span>
                  </div>

                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 20px ${currentGlow}20, 0 0 15px ${currentGlow}15` }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Area */}
        <div className="relative z-10 mt-12 h-20 flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={() => { if (failed) setLevel(1); startLevel(failed ? 1 : level); }}
              className="group relative px-10 py-4 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2), rgba(245,158,11,0.15))' }}
              />
              {/* Animated shine */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'brainWave 2s linear infinite' }}
                />
              </div>
              <span className="relative z-10 font-mono text-sm tracking-widest uppercase bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #c4b5fd, #67e8f9, #fde68a)' }}
              >
                {failed ? '⟳ Neural Reset' : level === 1 ? '⚡ Initialize Scan' : '⚡ Resume Scan'}
              </span>
            </button>
          ) : (
            <div className="text-center font-mono text-sm tracking-widest uppercase h-8 flex items-center justify-center">
              {isShowingSequence ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                    Mapping pattern...
                  </span>
                </div>
              ) : success ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Synapse Strengthened ✓
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Failure Overlay */}
        {failed && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
            style={{ background: 'radial-gradient(ellipse at center, rgba(244,63,94,0.08), transparent 70%)' }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 mb-2">
                Signal Lost
              </div>
              <div className="font-mono text-xs text-rose-400/60 tracking-widest uppercase">
                Neural pathway disrupted at level {level}
                {timeLeft <= 0 && " (TIME EXPIRED)"}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};
