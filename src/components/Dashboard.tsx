import React, { useEffect, useState } from 'react';
import { getGameState, UserStats, COUPONS } from '../lib/gameState';
import { cn } from '../lib/utils';

interface DashboardProps {
  onClose: () => void;
}

const RadarChart = ({ stats }: { stats: UserStats }) => {
  const size = 200;
  const center = size / 2;
  const maxRadius = size / 2 - 20;

  // Values 0-100
  const points = [
    stats.processingSpeed,
    stats.memoryCapacity,
    stats.spatialReasoning,
    stats.focusControl,
  ];

  const getCoordinatesForAngle = (angle: number, value: number) => {
    const radius = (value / 100) * maxRadius;
    const x = center + radius * Math.cos(angle - Math.PI / 2);
    const y = center + radius * Math.sin(angle - Math.PI / 2);
    return `${x},${y}`;
  };

  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const polygonPoints = points.map((val, i) => getCoordinatesForAngle(angles[i], val)).join(' ');

  return (
    <div className="relative flex items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grids */}
        {[20, 40, 60, 80, 100].map((val, idx) => (
          <polygon
            key={idx}
            points={angles.map(a => getCoordinatesForAngle(a, val)).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + maxRadius * Math.cos(a - Math.PI / 2)}
            y2={center + maxRadius * Math.sin(a - Math.PI / 2)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        {/* Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.4)"
          stroke="#8b5cf6"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />
        {/* Data Points */}
        {points.map((val, i) => {
          const coords = getCoordinatesForAngle(angles[i], val).split(',');
          return (
            <circle
              key={i}
              cx={coords[0]}
              cy={coords[1]}
              r="3"
              fill="#fff"
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      {/* Labels */}
      <div className="absolute top-0 text-[10px] font-mono text-violet-300 uppercase tracking-wider">Processing</div>
      <div className="absolute right-0 text-[10px] font-mono text-violet-300 uppercase tracking-wider translate-x-2">Memory</div>
      <div className="absolute bottom-0 text-[10px] font-mono text-violet-300 uppercase tracking-wider">Spatial</div>
      <div className="absolute left-0 text-[10px] font-mono text-violet-300 uppercase tracking-wider -translate-x-2">Focus</div>
    </div>
  );
};

const LEADERBOARD_MOCK = [
  { rank: 1, name: 'NeuralNinja', score: 12450, title: 'Quantum Mind' },
  { rank: 2, name: 'SynapseSnap', score: 11200, title: 'Cortex Master' },
  { rank: 3, name: 'Brainiac99', score: 9800, title: 'Neural Adept' },
  { rank: 4, name: 'Cognito', score: 8500, title: 'Neural Adept' },
  { rank: 5, name: 'Guest_1048', score: 7200, title: 'Synaptic Novice' },
];

export const Dashboard = ({ onClose }: DashboardProps) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard' | 'rewards'>('profile');

  useEffect(() => {
    setStats(getGameState());
    const handleUpdate = () => setStats(getGameState());
    window.addEventListener('cog_state_updated', handleUpdate);
    return () => window.removeEventListener('cog_state_updated', handleUpdate);
  }, []);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#0a0514] border border-violet-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col md:flex-row h-[85vh] md:h-[600px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/50 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl font-bold">
              U
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide">User_01</h3>
              <p className="text-xs font-mono text-violet-400">LVL {stats.level}</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2">
            {[
              { id: 'profile', label: 'Cognitive Profile', icon: '🧠' },
              { id: 'leaderboard', label: 'Global Rank', icon: '🏆' },
              { id: 'rewards', label: 'Rewards Vault', icon: '🎁' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  activeTab === tab.id ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden md:block">
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-rose-500">🔥</span>
                <span className="font-mono text-xs text-rose-300 uppercase tracking-wider">{stats.streak} Day Streak</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">Play daily to increase your synaptic resonance multiplier.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            ✕
          </button>

          {activeTab === 'profile' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-light text-white mb-8 tracking-wide">Neural <span className="font-bold text-violet-400">Analytics</span></h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6 border border-white/5">
                  <RadarChart stats={stats} />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-white/60 uppercase tracking-widest font-mono">Total XP</span>
                      <span className="text-2xl font-bold text-cyan-400">{stats.xp}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${(stats.xp % 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-white/40 mt-2 text-right">{100 - (stats.xp % 100)} XP to Next Level</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {[{label: 'Processing', val: stats.processingSpeed, color: 'text-violet-400'}, 
                       {label: 'Memory', val: stats.memoryCapacity, color: 'text-cyan-400'},
                       {label: 'Spatial', val: stats.spatialReasoning, color: 'text-emerald-400'},
                       {label: 'Focus', val: stats.focusControl, color: 'text-rose-400'}
                      ].map((s,i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{s.label}</span>
                          <span className={`text-xl font-bold ${s.color}`}>LVL {s.val}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-light text-white mb-8 tracking-wide">Global <span className="font-bold text-cyan-400">Rankings</span></h2>
              
              <div className="space-y-3">
                {LEADERBOARD_MOCK.map((user, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4 rounded-xl border", i === 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 border-white/5")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", i === 0 ? "bg-amber-500 text-black" : "bg-white/10 text-white")}>
                        {user.rank}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-xs font-mono text-white/40">{user.title}</div>
                      </div>
                    </div>
                    <div className="font-mono text-cyan-400 font-bold">{user.score} XP</div>
                  </div>
                ))}
                {/* Current User Mock Rank */}
                <div className="mt-8 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/30 uppercase tracking-widest bg-[#0a0514] px-2">Your Rank</div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-sm border border-violet-500/50">
                        842
                      </div>
                      <div>
                        <div className="font-bold text-white">User_01</div>
                        <div className="text-xs font-mono text-violet-400">Synaptic Novice</div>
                      </div>
                    </div>
                    <div className="font-mono text-violet-400 font-bold">{stats.xp} XP</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <h2 className="text-2xl font-light text-white mb-2 tracking-wide">Rewards <span className="font-bold text-emerald-400">Vault</span></h2>
              <p className="text-xs text-white/40 mb-8 font-mono tracking-wider">Complete full Neural Sequence levels (all 10 sublevels) to unlock exclusive coupons.</p>
              
              <div className="grid gap-4">
                {COUPONS.map((coupon, i) => {
                  const unlocked = stats.unlockedCoupons.includes(coupon.code);
                  return (
                    <div key={i} className={cn(
                      "flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all",
                      unlocked ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5 opacity-60 grayscale"
                    )}>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">{coupon.desc}</div>
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Unlocks after Sequence Level {coupon.levelReq}</div>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {unlocked ? (
                          <div className="px-4 py-2 rounded-lg bg-black/50 border border-emerald-500/50 font-mono text-emerald-400 font-bold tracking-widest text-center">
                            {coupon.code}
                          </div>
                        ) : (
                          <div className="px-4 py-2 rounded-lg bg-black/50 border border-white/10 font-mono text-white/30 tracking-widest flex items-center gap-2 justify-center">
                            <span>🔒</span> LOCKED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
