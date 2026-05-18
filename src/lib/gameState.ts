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

export const getActiveUser = (): string | null => {
  return localStorage.getItem('cog_active_user');
};

export const getLocalProfiles = (): string[] => {
  const profiles = localStorage.getItem('cog_profiles_list');
  return profiles ? JSON.parse(profiles) : [];
};

export const loginUser = (username: string) => {
  const normalized = username.trim();
  if (!normalized) return;
  
  localStorage.setItem('cog_active_user', normalized);
  
  // Add to profiles list if not exists
  const list = getLocalProfiles();
  if (!list.includes(normalized)) {
    list.push(normalized);
    localStorage.setItem('cog_profiles_list', JSON.stringify(list));
  }
  
  window.dispatchEvent(new Event('cog_state_updated'));
};

export const logoutUser = () => {
  localStorage.removeItem('cog_active_user');
  window.dispatchEvent(new Event('cog_state_updated'));
};

export const getGameState = (): UserStats => {
  const activeUser = getActiveUser();
  if (!activeUser) {
    return { ...DEFAULT_STATS, username: 'Guest' };
  }
  
  const saved = localStorage.getItem(`cog_user_state_${activeUser}`);
  if (!saved) {
    const newStats = { ...DEFAULT_STATS, username: activeUser };
    localStorage.setItem(`cog_user_state_${activeUser}`, JSON.stringify(newStats));
    return newStats;
  }
  
  try {
    const parsed = { ...DEFAULT_STATS, ...JSON.parse(saved) };
    const now = new Date();
    if (parsed.lastPlayed) {
      const last = new Date(parsed.lastPlayed);
      const diffTime = Math.abs(now.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 1 && diffDays < 3) {
        parsed.streak += 1;
      } else if (diffDays >= 3) {
        parsed.streak = 0;
      }
    }
    parsed.lastPlayed = now.toISOString();
    localStorage.setItem(`cog_user_state_${activeUser}`, JSON.stringify(parsed));
    return parsed;
  } catch {
    return { ...DEFAULT_STATS, username: activeUser };
  }
};

export const updateGameState = (updates: Partial<UserStats>) => {
  const activeUser = getActiveUser();
  if (!activeUser) return DEFAULT_STATS;

  const current = getGameState();
  const next = { ...current, ...updates };
  
  if (next.xp >= next.level * 100) {
    next.level += 1;
  }

  localStorage.setItem(`cog_user_state_${activeUser}`, JSON.stringify(next));
  window.dispatchEvent(new Event('cog_state_updated'));
  return next;
};

export const awardXP = (amount: number, statToBoost?: keyof UserStats) => {
  const activeUser = getActiveUser();
  if (!activeUser) return DEFAULT_STATS;

  const current = getGameState();
  const updates: Partial<UserStats> = { xp: current.xp + amount };
  
  if (statToBoost && typeof current[statToBoost] === 'number') {
    const newVal = Math.min(100, (current[statToBoost] as number) + Math.floor(amount / 10));
    (updates as any)[statToBoost] = newVal;
  }

  return updateGameState(updates);
};

export const checkAndAwardCoupons = () => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const completedRaw = localStorage.getItem(`cog_completed_${activeUser}`);
  if (!completedRaw) return;
  const completed = JSON.parse(completedRaw);
  
  const current = getGameState();
  const newCoupons = [...current.unlockedCoupons];
  let changed = false;

  COUPONS.forEach(coupon => {
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
