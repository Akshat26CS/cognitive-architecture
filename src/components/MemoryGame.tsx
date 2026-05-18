import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

// Level configurations — each level has a unique grid pattern & mechanic
const LEVELS = [
  { id: 1, name: 'Initiation', gridSize: 4, seqLength: 3, speed: 0.8, color: '#8b5cf6', cols: 2, timer: false, reverse: false, rotate: false, distract: false },
  { id: 2, name: 'Encoding', gridSize: 6, seqLength: 4, speed: 0.7, color: '#06b6d4', cols: 3, timer: false, reverse: false, rotate: false, distract: false },
  { id: 3, name: 'Recall', gridSize: 9, seqLength: 5, speed: 0.65, color: '#10b981', cols: 3, timer: false, reverse: false, rotate: false, distract: true },
  { id: 4, name: 'Focus', gridSize: 9, seqLength: 6, speed: 0.5, color: '#f59e0b', cols: 3, timer: false, reverse: false, rotate: false, distract: true },
  { id: 5, name: 'Decay', gridSize: 9, seqLength: 7, speed: 0.45, color: '#f43f5e', cols: 3, timer: true, reverse: false, rotate: false, distract: true },
  { id: 6, name: 'Disruption', gridSize: 12, seqLength: 7, speed: 0.4, color: '#ec4899', cols: 4, timer: true, reverse: false, rotate: true, distract: true },
  { id: 7, name: 'Overload', gridSize: 12, seqLength: 8, speed: 0.35, color: '#a855f7', cols: 4, timer: true, reverse: true, rotate: false, distract: true },
  { id: 8, name: 'Transcend', gridSize: 16, seqLength: 9, speed: 0.3, color: '#14b8a6', cols: 4, timer: true, reverse: true, rotate: true, distract: true },
];

const ALL_COLORS = [
  { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', name: 'Prefrontal' },
  { bg: '#06b6d4', glow: 'rgba(6,182,212,0.6)', name: 'Motor' },
  { bg: '#f59e0b', glow: 'rgba(245,158,11,0.6)', name: 'Sensory' },
  { bg: '#ec4899', glow: 'rgba(236,72,153,0.6)', name: 'Temporal' },
  { bg: '#10b981', glow: 'rgba(16,185,129,0.6)', name: 'Parietal' },
  { bg: '#f43f5e', glow: 'rgba(244,63,94,0.6)', name: 'Occipital' },
  { bg: '#3b82f6', glow: 'rgba(59,130,246,0.6)', name: 'Limbic' },
  { bg: '#a855f7', glow: 'rgba(168,85,247,0.6)', name: 'Cerebellum' },
  { bg: '#14b8a6', glow: 'rgba(20,184,166,0.6)', name: 'Brain Stem' },
  { bg: '#64748b', glow: 'rgba(100,116,139,0.6)', name: 'Thalamus' },
  { bg: '#f97316', glow: 'rgba(249,115,22,0.6)', name: 'Hypothalamus' },
  { bg: '#84cc16', glow: 'rgba(132,204,22,0.6)', name: 'Corpus' },
  { bg: '#22d3ee', glow: 'rgba(34,211,238,0.6)', name: 'Cortex' },
  { bg: '#fb7185', glow: 'rgba(251,113,133,0.6)', name: 'Axon' },
  { bg: '#c084fc', glow: 'rgba(192,132,252,0.6)', name: 'Synapse' },
  { bg: '#2dd4bf', glow: 'rgba(45,212,191,0.6)', name: 'Dendrite' },
];

export const MemoryGame = () => {
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[0] | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [distractionNode, setDistractionNode] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [bestLevels, setBestLevels] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cognitive_best_levels');
    if (saved) setBestLevels(JSON.parse(saved));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startGame = useCallback((level: typeof LEVELS[0]) => {
    setSelectedLevel(level);
    setIsPlaying(true);
    setPlayerSequence([]);
    setFailed(false);
    setSuccess(false);
    setIsShowingSequence(true);
    setIsRotated(false);
    setTimeLeft(100);
    if (timerRef.current) clearInterval(timerRef.current);

    const newSequence = Array.from({ length: level.seqLength }, () => Math.floor(Math.random() * level.gridSize));
    setSequence(newSequence);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsShowingSequence(false);
        if (level.rotate) setIsRotated(true);
        if (level.timer) {
          const duration = 12000;
          const interval = 50;
          const dec = (interval / duration) * 100;
          timerRef.current = setInterval(() => {
            setTimeLeft(p => {
              if (p <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                setFailed(true);
                setIsPlaying(false);
                return 0;
              }
              return p - dec;
            });
          }, interval);
        }
      }
    });

    tl.to({}, { duration: 0.6 });
    newSequence.forEach((nodeIndex) => {
      const addDist = level.distract && Math.random() > 0.65;
      let distNode = -1;
      if (addDist) {
        distNode = Math.floor(Math.random() * level.gridSize);
        while (distNode === nodeIndex) distNode = Math.floor(Math.random() * level.gridSize);
      }
      tl.call(() => setActiveNode(nodeIndex))
        .call(() => { if (addDist) setDistractionNode(distNode); })
        .to({}, { duration: level.speed })
        .call(() => { setActiveNode(null); setDistractionNode(null); })
        .to({}, { duration: 0.15 });
    });
  }, []);

  const handleNodeClick = (index: number) => {
    if (!isPlaying || isShowingSequence || failed || success || !selectedLevel) return;
    const domNode = document.getElementById(`node-${index}`);
    if (domNode) gsap.fromTo(domNode, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });

    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);
    const ci = newPlayerSeq.length - 1;
    const ti = selectedLevel.reverse ? sequence.length - 1 - ci : ci;

    if (sequence[ti] !== index) {
      if (timerRef.current) clearInterval(timerRef.current);
      setFailed(true);
      setIsPlaying(false);
      setIsRotated(false);
      gsap.to(containerRef.current, { x: 8, yoyo: true, repeat: 5, duration: 0.06, ease: 'power2.inOut' });
      return;
    }
    if (newPlayerSeq.length === sequence.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSuccess(true);
      setIsPlaying(false);
      setIsRotated(false);
      const newBest = { ...bestLevels, [selectedLevel.id]: true };
      setBestLevels(newBest);
      localStorage.setItem('cognitive_best_levels', JSON.stringify(newBest));
    }
  };

  const progressRatio = isPlaying && !isShowingSequence ? playerSequence.length / sequence.length : 0;

  // ─── Level Selection View ───
  if (!selectedLevel) {
    return (
      <div className="w-full max-w-4xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => startGame(lvl)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: `linear-gradient(160deg, ${lvl.color}15, rgba(10,10,10,0.9))`,
                border: `1px solid ${lvl.color}25`,
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(160deg, ${lvl.color}20, transparent 60%)` }} />
              <div className="relative z-10 p-5 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-full border" style={{ borderColor: `${lvl.color}40`, color: lvl.color }}>
                    LV {lvl.id.toString().padStart(2, '0')}
                  </span>
                  {bestLevels[lvl.id] && <span className="text-xs text-emerald-400">✓</span>}
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{lvl.name}</h4>
                <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">
                  {lvl.cols}×{lvl.gridSize / lvl.cols} · {lvl.seqLength} nodes
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {lvl.timer && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono">TIMER</span>}
                  {lvl.rotate && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">ROTATE</span>}
                  {lvl.reverse && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-mono">REVERSE</span>}
                  {lvl.distract && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono">GLITCH</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Active Game View ───
  const nodeColors = ALL_COLORS.slice(0, selectedLevel.gridSize);

  return (
    <div className="w-full max-w-4xl px-6 flex flex-col items-center">
      <style>{`
        @keyframes nodeIdle { 0%, 100% { box-shadow: 0 0 0px transparent; } 50% { box-shadow: 0 0 12px var(--node-glow); } }
        @keyframes glitchFlash { 0%, 100% { opacity:1; filter: hue-rotate(0deg); } 50% { opacity:0.8; filter: hue-rotate(90deg) contrast(150%); } }
      `}</style>

      {/* Level Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: selectedLevel.color }}>
            Level {selectedLevel.id} — {selectedLevel.name}
          </span>
          <div className="flex gap-1 mt-1">
            {selectedLevel.reverse && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono animate-pulse">REVERSE MODE</span>}
            {isRotated && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">ROTATED</span>}
          </div>
        </div>
        <button onClick={() => { setSelectedLevel(null); setIsPlaying(false); if(timerRef.current) clearInterval(timerRef.current); }} className="text-white/40 hover:text-white text-xs font-mono transition-colors">✕ EXIT</button>
      </div>

      {/* Progress + Timer */}
      <div className="w-full max-w-md mb-6 space-y-2">
        {isPlaying && !isShowingSequence && !failed && (
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressRatio * 100}%`, background: `linear-gradient(90deg, ${selectedLevel.color}, #10b981)` }} />
          </div>
        )}
        {selectedLevel.timer && isPlaying && !isShowingSequence && !failed && (
          <div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${timeLeft}%`, background: timeLeft > 50 ? '#10b981' : timeLeft > 25 ? '#f59e0b' : '#f43f5e', transition: 'width 0.1s linear' }} />
            </div>
            <span className="font-mono text-[9px] text-rose-400/50 mt-1 block text-right animate-pulse">DECAY TIMER</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="grid gap-3 md:gap-4 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={{
          gridTemplateColumns: `repeat(${selectedLevel.cols}, 1fr)`,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(10,5,20,0.9) 100%)',
          transform: isRotated ? 'rotate(90deg)' : 'none',
          transition: 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {Array.from({ length: selectedLevel.gridSize }).map((_, i) => {
          const nc = nodeColors[i % nodeColors.length];
          const isActive = activeNode === i;
          const isDist = distractionNode === i;
          const vis = isActive || isDist;
          const bg = isDist ? '#f43f5e' : nc.bg;
          const glow = isDist ? 'rgba(244,63,94,0.8)' : nc.glow;

          return (
            <button
              key={i}
              id={`node-${i}`}
              onClick={() => handleNodeClick(i)}
              disabled={isShowingSequence || !isPlaying}
              className={cn(
                "relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl transition-all duration-300",
                !isPlaying && "opacity-40 cursor-not-allowed",
                isPlaying && !isShowingSequence && !failed && "cursor-pointer hover:scale-105 active:scale-95",
              )}
              style={{
                ['--node-glow' as string]: glow,
                background: vis ? `radial-gradient(circle at center, ${bg}, ${bg}88)` : `linear-gradient(135deg, ${nc.bg}15, ${nc.bg}08)`,
                border: `1px solid ${vis ? bg : `${nc.bg}25`}`,
                boxShadow: vis ? `0 0 30px ${glow}, inset 0 0 20px ${glow}30` : 'none',
                transform: vis ? 'scale(1.08)' : undefined,
                animation: isDist ? 'glitchFlash 0.2s ease-in-out infinite' : isPlaying && !vis && !isShowingSequence ? 'nodeIdle 3s ease-in-out infinite' : 'none',
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: isRotated ? 'rotate(-90deg)' : 'none', transition: 'transform 1s' }}>
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full" style={{ background: vis ? `radial-gradient(circle, white, ${bg})` : `radial-gradient(circle, ${nc.bg}40, transparent)` }} />
              </div>
              <div className="absolute bottom-1 left-0 right-0 text-center" style={{ transform: isRotated ? 'rotate(-90deg)' : 'none', transition: 'transform 1s' }}>
                <span className="font-mono text-[6px] md:text-[7px] uppercase tracking-wider" style={{ color: vis ? '#fff' : `${nc.bg}50` }}>
                  {isDist ? 'ERR' : nc.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-8 h-16 flex items-center justify-center">
        {isShowingSequence && (
          <div className="flex items-center gap-3 font-mono text-sm">
            <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 uppercase tracking-widest">Mapping pattern...</span>
          </div>
        )}
        {success && (
          <div className="text-center">
            <div className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">Level Complete ✓</div>
            <button onClick={() => setSelectedLevel(null)} className="font-mono text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors">
              ← Back to Levels
            </button>
          </div>
        )}
        {failed && (
          <div className="text-center">
            <div className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 mb-2">Signal Lost</div>
            <div className="flex gap-4 justify-center mt-2">
              <button onClick={() => startGame(selectedLevel)} className="font-mono text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors">Retry</button>
              <button onClick={() => setSelectedLevel(null)} className="font-mono text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors">← Levels</button>
            </div>
          </div>
        )}
        {isPlaying && !isShowingSequence && !failed && !success && (
          <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
            {selectedLevel.reverse ? 'Input sequence in REVERSE' : 'Replicate the signal path'}
            {` (${playerSequence.length}/${sequence.length})`}
          </span>
        )}
      </div>
    </div>
  );
};
