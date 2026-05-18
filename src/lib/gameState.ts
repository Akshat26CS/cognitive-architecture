export interface UserStats {
  username: string;
  processingSpeed: number; // 0-100
  memoryCapacity: number; // 0-100
  spatialReasoning: number; // 0-100
  focusControl: number; // 0-100
  xp: number;
  level: number;
  streak: number;
  lastPlayed: string | null;
  unlockedCoupons: string[];
}

const DEFAULT_STATS: UserStats = {
  username: 'Guest User',
  processingSpeed: 10,
  memoryCapacity: 15,
  spatialReasoning: 10,
  focusControl: 20,
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayed: null,
  unlockedCoupons: [],
};

export const COUPONS = [
  { levelReq: 1, code: 'NEURO10', desc: '10% Off Storewide' },
  { levelReq: 3, code: 'SYNAPSE20', desc: '20% Off Cognitive Supplements' },
  { levelReq: 5, code: 'CORTEXFREE', desc: 'Free Consultation' },
  { levelReq: 8, code: 'QUANTUM50', desc: '50% Off Premium Plan' },
];

export const getGameState = (): UserStats => {
  const saved = localStorage.getItem('cog_user_state');
  if (!saved) return DEFAULT_STATS;
  
  try {
    const parsed = { ...DEFAULT_STATS, ...JSON.parse(saved) };
    // Handle daily streak logic
    const now = new Date();
    if (parsed.lastPlayed) {
      const last = new Date(parsed.lastPlayed);
      const diffTime = Math.abs(now.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1 && diffDays < 3) {
        // Increment streak if played yesterday
        parsed.streak += 1;
      } else if (diffDays >= 3) {
        // Reset streak if more than 48 hours passed
        parsed.streak = 0;
      }
    }
    parsed.lastPlayed = now.toISOString();
    localStorage.setItem('cog_user_state', JSON.stringify(parsed));
    return parsed;
  } catch {
    return DEFAULT_STATS;
  }
};

export const updateGameState = (updates: Partial<UserStats>) => {
  const current = getGameState();
  const next = { ...current, ...updates };
  
  // Level up logic (every 100 XP)
  if (next.xp >= next.level * 100) {
    next.level += 1;
  }

  localStorage.setItem('cog_user_state', JSON.stringify(next));
  window.dispatchEvent(new Event('cog_state_updated'));
  return next;
};

export const awardXP = (amount: number, statToBoost?: keyof UserStats) => {
  const current = getGameState();
  const updates: Partial<UserStats> = { xp: current.xp + amount };
  
  if (statToBoost && typeof current[statToBoost] === 'number') {
    // Increase specific stat slightly, max 100
    const newVal = Math.min(100, (current[statToBoost] as number) + Math.floor(amount / 10));
    (updates as any)[statToBoost] = newVal;
  }

  return updateGameState(updates);
};

// Check if user completed all sublevels of a major level
export const checkAndAwardCoupons = () => {
  const completedRaw = localStorage.getItem('cog_completed');
  if (!completedRaw) return;
  const completed = JSON.parse(completedRaw);
  
  const current = getGameState();
  const newCoupons = [...current.unlockedCoupons];
  let changed = false;

  COUPONS.forEach(coupon => {
    // Check if they completed all 10 sublevels of the required level (0-indexed)
    let hasCompletedLevel = true;
    for (let i = 0; i < 10; i++) {
      if (!completed[`${coupon.levelReq - 1}-${i}`]) {
        hasCompletedLevel = false;
        break;
      }
    }

    if (hasCompletedLevel && !newCoupons.includes(coupon.code)) {
      newCoupons.push(coupon.code);
      changed = true;
    }
  });

  if (changed) {
    updateGameState({ unlockedCoupons: newCoupons });
  }
};
