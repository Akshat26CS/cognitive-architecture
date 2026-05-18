import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import gsap from 'gsap';

// ─── Level & Sublevel System ───
const LEVEL_META = [
  { id: 1, name: 'INITIATION', color: '#8b5cf6', gridSize: 4, cols: 2, baseSeq: 2, timer: false, reverse: false, rotate: false, distract: false },
  { id: 2, name: 'ENCODING', color: '#06b6d4', gridSize: 6, cols: 3, baseSeq: 3, timer: false, reverse: false, rotate: false, distract: false },
  { id: 3, name: 'RECALL', color: '#10b981', gridSize: 9, cols: 3, baseSeq: 3, timer: false, reverse: false, rotate: false, distract: true },
  { id: 4, name: 'FOCUS', color: '#f59e0b', gridSize: 9, cols: 3, baseSeq: 4, timer: false, reverse: false, rotate: false, distract: true },
  { id: 5, name: 'DECAY', color: '#f43f5e', gridSize: 9, cols: 3, baseSeq: 4, timer: true, reverse: false, rotate: false, distract: true },
  { id: 6, name: 'DISRUPTION', color: '#ec4899', gridSize: 12, cols: 4, baseSeq: 5, timer: true, reverse: false, rotate: true, distract: true },
  { id: 7, name: 'OVERLOAD', color: '#a855f7', gridSize: 12, cols: 4, baseSeq: 5, timer: true, reverse: true, rotate: false, distract: true },
  { id: 8, name: 'TRANSCEND', color: '#14b8a6', gridSize: 16, cols: 4, baseSeq: 6, timer: true, reverse: true, rotate: true, distract: true },
];

const SUBS_PER_LEVEL = 10;

const ALL_COLORS = [
  { bg: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', name: 'PFC' },
  { bg: '#06b6d4', glow: 'rgba(6,182,212,0.6)', name: 'MOT' },
  { bg: '#f59e0b', glow: 'rgba(245,158,11,0.6)', name: 'SEN' },
  { bg: '#ec4899', glow: 'rgba(236,72,153,0.6)', name: 'TMP' },
  { bg: '#10b981', glow: 'rgba(16,185,129,0.6)', name: 'PAR' },
  { bg: '#f43f5e', glow: 'rgba(244,63,94,0.6)', name: 'OCC' },
  { bg: '#3b82f6', glow: 'rgba(59,130,246,0.6)', name: 'LMB' },
  { bg: '#a855f7', glow: 'rgba(168,85,247,0.6)', name: 'CRB' },
  { bg: '#14b8a6', glow: 'rgba(20,184,166,0.6)', name: 'BST' },
  { bg: '#64748b', glow: 'rgba(100,116,139,0.6)', name: 'THL' },
  { bg: '#f97316', glow: 'rgba(249,115,22,0.6)', name: 'HYP' },
  { bg: '#84cc16', glow: 'rgba(132,204,22,0.6)', name: 'CRP' },
  { bg: '#22d3ee', glow: 'rgba(34,211,238,0.6)', name: 'CTX' },
  { bg: '#fb7185', glow: 'rgba(251,113,133,0.6)', name: 'AXN' },
  { bg: '#c084fc', glow: 'rgba(192,132,252,0.6)', name: 'SYN' },
  { bg: '#2dd4bf', glow: 'rgba(45,212,191,0.6)', name: 'DND' },
];

type View = 'levels' | 'sublevels' | 'game';

export const MemoryGame = () => {
  const [view, setView] = useState<View>('levels');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedSub, setSelectedSub] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  // Game state
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [distNode, setDistNode] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);

  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('cog_completed');
    if (s) setCompleted(JSON.parse(s));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const key = (l: number, s: number) => `${l}-${s}`;
  const isLevelUnlocked = (lvlIdx: number) => {
    if (lvlIdx === 0) return true;
    for (let i = 0; i < SUBS_PER_LEVEL; i++) {
      if (!completed[key(lvlIdx - 1, i)]) return false;
    }
    return true;
  };
  const completedInLevel = (lvlIdx: number) => {
    let c = 0;
    for (let i = 0; i < SUBS_PER_LEVEL; i++) if (completed[key(lvlIdx, i)]) c++;
    return c;
  };

  const getConfig = (lvlIdx: number, subIdx: number) => {
    const meta = LEVEL_META[lvlIdx];
    const seqLen = meta.baseSeq + Math.floor(subIdx * 0.7);
    const speed = Math.max(0.2, 0.8 - (lvlIdx * 0.06) - (subIdx * 0.03));
    const timerDuration = meta.timer ? Math.max(5000, 14000 - (lvlIdx * 500) - (subIdx * 400)) : 0;
    return { ...meta, seqLen, speed, timerDuration };
  };

  const startGame = useCallback((lvlIdx: number, subIdx: number) => {
    setSelectedLevel(lvlIdx);
    setSelectedSub(subIdx);
    setView('game');
    setPlayerSeq([]);
    setFailed(false);
    setSuccess(false);
    setIsShowing(true);
    setIsPlaying(true);
    setIsRotated(false);
    setTimeLeft(100);
    if (timerRef.current) clearInterval(timerRef.current);

    const cfg = getConfig(lvlIdx, subIdx);
    const seq = Array.from({ length: cfg.seqLen }, () => Math.floor(Math.random() * cfg.gridSize));
    setSequence(seq);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsShowing(false);
        if (cfg.rotate) setIsRotated(true);
        if (cfg.timer && cfg.timerDuration > 0) {
          const interval = 50;
          const dec = (interval / cfg.timerDuration) * 100;
          timerRef.current = setInterval(() => {
            setTimeLeft(p => {
              if (p <= 0) { if (timerRef.current) clearInterval(timerRef.current); setFailed(true); setIsPlaying(false); return 0; }
              return p - dec;
            });
          }, interval);
        }
      }
    });
    tl.to({}, { duration: 0.5 });
    seq.forEach(ni => {
      const addD = cfg.distract && Math.random() > 0.6;
      let dn = -1;
      if (addD) { dn = Math.floor(Math.random() * cfg.gridSize); while (dn === ni) dn = Math.floor(Math.random() * cfg.gridSize); }
      tl.call(() => setActiveNode(ni)).call(() => { if (addD) setDistNode(dn); })
        .to({}, { duration: cfg.speed })
        .call(() => { setActiveNode(null); setDistNode(null); })
        .to({}, { duration: 0.12 });
    });
  }, []);

  const handleClick = (i: number) => {
    if (!isPlaying || isShowing || failed || success) return;
    const dom = document.getElementById(`gn-${i}`);
    if (dom) gsap.fromTo(dom, { scale: 0.85 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
    const np = [...playerSeq, i];
    setPlayerSeq(np);
    const cfg = getConfig(selectedLevel, selectedSub);
    const ci = np.length - 1;
    const ti = cfg.reverse ? sequence.length - 1 - ci : ci;
    if (sequence[ti] !== i) {
      if (timerRef.current) clearInterval(timerRef.current);
      setFailed(true); setIsPlaying(false); setIsRotated(false);
      gsap.to(gridRef.current, { x: 6, yoyo: true, repeat: 5, duration: 0.05, ease: 'power2.inOut' });
      return;
    }
    if (np.length === sequence.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSuccess(true); setIsPlaying(false); setIsRotated(false);
      const nk = key(selectedLevel, selectedSub);
      const nc = { ...completed, [nk]: true };
      setCompleted(nc);
      localStorage.setItem('cog_completed', JSON.stringify(nc));
    }
  };

  const prog = isPlaying && !isShowing ? playerSeq.length / sequence.length : 0;
  const cfg = view === 'game' ? getConfig(selectedLevel, selectedSub) : null;

  // ══════════════════════════════════════════════
  // LEVEL MAP VIEW
  // ══════════════════════════════════════════════
  if (view === 'levels') {
    return (
      <div className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {LEVEL_META.map((lvl, idx) => {
            const unlocked = isLevelUnlocked(idx);
            const done = completedInLevel(idx);
            return (
              <button key={lvl.id} disabled={!unlocked}
                onClick={() => { setSelectedLevel(idx); setView('sublevels'); }}
                className={cn("group relative rounded-2xl overflow-hidden text-left transition-all duration-500", unlocked ? "hover:-translate-y-2 hover:shadow-2xl cursor-pointer" : "opacity-40 cursor-not-allowed")}
                style={{ background: `linear-gradient(160deg, ${lvl.color}10, rgba(8,5,15,0.95))`, border: `1px solid ${unlocked ? `${lvl.color}30` : 'rgba(255,255,255,0.05)'}` }}
              >
                {/* Glow on hover */}
                {unlocked && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${lvl.color}25, transparent 70%)` }} />}

                <div className="relative z-10 p-5 md:p-6 flex flex-col min-h-[180px]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] tracking-[0.3em] px-2.5 py-1 rounded-md border font-bold" style={{ borderColor: `${lvl.color}40`, color: lvl.color, background: `${lvl.color}10` }}>
                      {unlocked ? `LV ${lvl.id.toString().padStart(2, '0')}` : '🔒'}
                    </span>
                    {unlocked && done === SUBS_PER_LEVEL && <span className="text-emerald-400 text-sm">★</span>}
                  </div>
                  <h4 className="text-base md:text-lg font-bold tracking-wider text-white mb-1">{lvl.name}</h4>
                  <p className="text-white/25 text-[9px] font-mono uppercase tracking-wider mb-auto">
                    {lvl.cols}×{lvl.gridSize / lvl.cols} · {lvl.baseSeq}+ nodes
                  </p>
                  {/* Progress bar */}
                  {unlocked && (
                    <div className="mt-4">
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(done / SUBS_PER_LEVEL) * 100}%`, background: lvl.color }} />
                      </div>
                      <span className="font-mono text-[8px] text-white/30 mt-1 block">{done}/{SUBS_PER_LEVEL}</span>
                    </div>
                  )}
                  {/* Modifier badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lvl.timer && <span className="text-[7px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400/70 font-mono">TMR</span>}
                    {lvl.rotate && <span className="text-[7px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400/70 font-mono">ROT</span>}
                    {lvl.reverse && <span className="text-[7px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400/70 font-mono">REV</span>}
                    {lvl.distract && <span className="text-[7px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400/70 font-mono">GLT</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // SUBLEVEL MAP VIEW
  // ══════════════════════════════════════════════
  if (view === 'sublevels') {
    const meta = LEVEL_META[selectedLevel];
    return (
      <div className="w-full max-w-3xl px-4">
        {/* Back */}
        <button onClick={() => setView('levels')} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 group transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span className="font-mono text-xs uppercase tracking-widest">All Levels</span>
        </button>

        {/* Level Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-mono text-xl font-black" style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30`, color: meta.color }}>
            {meta.id}
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-wider text-white">{meta.name}</h3>
            <p className="text-white/30 font-mono text-[10px] uppercase tracking-wider">{completedInLevel(selectedLevel)}/{SUBS_PER_LEVEL} completed</p>
          </div>
        </div>

        {/* Sublevel Grid */}
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: SUBS_PER_LEVEL }).map((_, si) => {
            const done = completed[key(selectedLevel, si)];
            const prevDone = si === 0 || completed[key(selectedLevel, si - 1)];
            const unlocked = prevDone;
            const subCfg = getConfig(selectedLevel, si);
            return (
              <button key={si} disabled={!unlocked}
                onClick={() => startGame(selectedLevel, si)}
                className={cn("group relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300", unlocked ? "hover:scale-105 hover:shadow-xl cursor-pointer" : "opacity-30 cursor-not-allowed")}
                style={{ background: done ? `${meta.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? meta.color : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}` }}
              >
                {done && <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: `inset 0 0 15px ${meta.color}15` }} />}
                <span className={cn("font-mono text-lg font-bold", done ? "" : "text-white/50")} style={done ? { color: meta.color } : {}}>
                  {(si + 1).toString().padStart(2, '0')}
                </span>
                {done && <span className="text-emerald-400 text-[10px] mt-0.5">✓</span>}
                {!unlocked && <span className="text-[10px] text-white/20 mt-0.5">🔒</span>}
                <span className="text-[7px] font-mono text-white/20 mt-1">{subCfg.seqLen} seq</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // GAME VIEW
  // ══════════════════════════════════════════════
  const meta = LEVEL_META[selectedLevel];
  const nc = ALL_COLORS.slice(0, meta.gridSize);

  return (
    <div className="w-full max-w-4xl px-4 flex flex-col items-center">
      <style>{`
        @keyframes nodeIdle { 0%,100%{box-shadow:0 0 0 transparent} 50%{box-shadow:0 0 10px var(--ng)} }
        @keyframes glitch { 0%,100%{opacity:1;filter:hue-rotate(0)} 50%{opacity:.7;filter:hue-rotate(90deg) contrast(150%)} }
      `}</style>

      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between mb-5 px-2">
        <button onClick={() => { setView('sublevels'); setIsPlaying(false); if(timerRef.current) clearInterval(timerRef.current); }}
          className="text-white/30 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          EXIT
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest" style={{ color: meta.color }}>
            LV{meta.id} · {selectedSub + 1}/{SUBS_PER_LEVEL}
          </span>
          {cfg?.reverse && <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono animate-pulse">REV</span>}
          {isRotated && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">ROT</span>}
        </div>
      </div>

      {/* Progress + Timer */}
      <div className="w-full max-w-sm mb-5 space-y-2">
        {isPlaying && !isShowing && !failed && (
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200" style={{ width: `${prog * 100}%`, background: meta.color }} />
          </div>
        )}
        {cfg?.timer && isPlaying && !isShowing && !failed && (
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${timeLeft}%`, background: timeLeft > 50 ? '#10b981' : timeLeft > 25 ? '#f59e0b' : '#f43f5e', transition: 'width .1s linear' }} />
          </div>
        )}
      </div>

      {/* Grid */}
      <div ref={gridRef}
        className="grid gap-2.5 md:gap-3 p-4 md:p-5 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        style={{
          gridTemplateColumns: `repeat(${meta.cols}, 1fr)`,
          background: 'linear-gradient(145deg, rgba(15,10,25,0.95), rgba(5,3,10,0.98))',
          transform: isRotated ? 'rotate(90deg)' : 'none',
          transition: 'transform .8s cubic-bezier(.68,-.55,.265,1.55)',
        }}
      >
        {Array.from({ length: meta.gridSize }).map((_, i) => {
          const c = nc[i % nc.length];
          const isA = activeNode === i;
          const isD = distNode === i;
          const vis = isA || isD;
          const bg = isD ? '#f43f5e' : c.bg;
          const gw = isD ? 'rgba(244,63,94,0.8)' : c.glow;
          return (
            <button key={i} id={`gn-${i}`} onClick={() => handleClick(i)} disabled={isShowing || !isPlaying}
              className={cn("relative w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-xl transition-all duration-200", !isPlaying && "opacity-35 cursor-not-allowed", isPlaying && !isShowing && !failed && "cursor-pointer hover:scale-105 active:scale-95")}
              style={{
                ['--ng' as string]: gw,
                background: vis ? `radial-gradient(circle,${bg},${bg}88)` : `linear-gradient(135deg,${c.bg}12,${c.bg}06)`,
                border: `1px solid ${vis ? bg : `${c.bg}20`}`,
                boxShadow: vis ? `0 0 25px ${gw}, inset 0 0 15px ${gw}30` : 'none',
                transform: vis ? 'scale(1.08)' : undefined,
                animation: isD ? 'glitch .2s infinite' : isPlaying && !vis && !isShowing ? 'nodeIdle 3s ease-in-out infinite' : 'none',
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: isRotated ? 'rotate(-90deg)' : 'none', transition: 'transform .8s' }}>
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full" style={{ background: vis ? `radial-gradient(circle,white,${bg})` : `radial-gradient(circle,${c.bg}35,transparent)` }} />
              </div>
              <div className="absolute bottom-0.5 inset-x-0 text-center" style={{ transform: isRotated ? 'rotate(-90deg)' : 'none', transition: 'transform .8s' }}>
                <span className="font-mono text-[6px] uppercase" style={{ color: vis ? '#fff' : `${c.bg}45` }}>{isD ? 'ERR' : c.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div className="mt-6 h-20 flex items-center justify-center text-center">
        {isShowing && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">{[0,1,2].map(j=><div key={j} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{backgroundColor:meta.color, animationDelay:`${j*.12}s`}}/>)}</div>
            <span className="font-mono text-sm uppercase tracking-widest" style={{color:meta.color}}>Mapping pattern...</span>
          </div>
        )}
        {success && (
          <div>
            <div className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">Stage {selectedSub + 1} Complete ✓</div>
            <div className="flex gap-4 justify-center">
              {selectedSub < SUBS_PER_LEVEL - 1 && (
                <button onClick={() => startGame(selectedLevel, selectedSub + 1)} className="px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors border" style={{borderColor:`${meta.color}40`, color:meta.color}}>Next →</button>
              )}
              <button onClick={() => setView('sublevels')} className="text-white/30 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">Map</button>
            </div>
          </div>
        )}
        {failed && (
          <div>
            <div className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 mb-3">Signal Lost</div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => startGame(selectedLevel, selectedSub)} className="px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-widest border border-white/15 text-white/50 hover:text-white transition-colors">Retry</button>
              <button onClick={() => setView('sublevels')} className="text-white/30 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">Map</button>
            </div>
          </div>
        )}
        {isPlaying && !isShowing && !failed && !success && (
          <span className="text-white/35 font-mono text-xs uppercase tracking-widest">
            {cfg?.reverse ? 'REVERSE ORDER' : 'Replicate signal'} · {playerSeq.length}/{sequence.length}
          </span>
        )}
      </div>
    </div>
  );
};
