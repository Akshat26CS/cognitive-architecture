import { supabase } from './supabaseClient';

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
  completedStages: string[];
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
  completedStages: [],
};

export const COUPONS = [
  { levelReq: 1, code: 'NEURO10', desc: '10% Off Storewide' },
  { levelReq: 3, code: 'SYNAPSE20', desc: '20% Off Cognitive Supplements' },
  { levelReq: 5, code: 'CORTEXFREE', desc: 'Free Consultation' },
  { levelReq: 8, code: 'QUANTUM50', desc: '50% Off Premium Plan' },
];

// Helper to check if a user is currently logged into Supabase
export const getActiveUser = (): string | null => {
  const cached = localStorage.getItem('cog_active_user');
  return cached || null;
};

// Returns cached stats from localStorage (instant/synchronous for UI)
export const getGameState = (): UserStats => {
  const activeUser = getActiveUser();
  const storageKey = activeUser ? `cog_user_state_${activeUser}` : 'cog_user_state_Guest';
  const saved = localStorage.getItem(storageKey);
  
  if (!saved) {
    const initial = { ...DEFAULT_STATS, username: activeUser || 'Guest User' };
    localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }
  
  try {
    const parsed = { ...DEFAULT_STATS, ...JSON.parse(saved) };
    const now = new Date();
    if (parsed.lastPlayed) {
      const last = new Date(parsed.lastPlayed);
      const diffTime = Math.abs(now.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        parsed.streak += 1;
      } else if (diffDays > 1) {
        parsed.streak = 0;
      }
    }
    parsed.lastPlayed = now.toISOString();
    localStorage.setItem(storageKey, JSON.stringify(parsed));
    return parsed;
  } catch {
    return { ...DEFAULT_STATS, username: activeUser || 'Guest User' };
  }
};

// Optimistic offline-first updates that run async Supabase sync in the background
export const updateGameState = (updates: Partial<UserStats>) => {
  const activeUser = getActiveUser();
  const current = getGameState();
  const next = { ...current, ...updates };
  
  if (next.xp >= next.level * 100) {
    next.level += 1;
  }

  // Save locally first for instant UI response
  const storageKey = activeUser ? `cog_user_state_${activeUser}` : 'cog_user_state_Guest';
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event('cog_state_updated'));

  // Sync to Supabase in the background if logged in
  if (activeUser) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map camelCase to snake_case for Supabase
        const payload = {
          username: next.username,
          level: next.level,
          xp: next.xp,
          processing_speed: next.processingSpeed,
          memory_capacity: next.memoryCapacity,
          spatial_reasoning: next.spatialReasoning,
          focus_control: next.focusControl,
          streak: next.streak,
          unlocked_coupons: next.unlockedCoupons,
          completed_stages: next.completedStages,
          updated_at: new Date().toISOString(),
        };
        supabase.from('profiles').update(payload).eq('id', session.user.id).then();
      }
    });
  }

  return next;
};

// Award XP and increment dynamic stats
export const awardXP = (amount: number, statToBoost?: keyof UserStats) => {
  const current = getGameState();
  const updates: Partial<UserStats> = { xp: current.xp + amount };
  
  if (statToBoost && typeof current[statToBoost] === 'number') {
    const newVal = Math.min(100, (current[statToBoost] as number) + Math.floor(amount / 10));
    (updates as any)[statToBoost] = newVal;
  }

  return updateGameState(updates);
};

// Check if user completed all 10 sublevels of a level to award coupon
export const checkAndAwardCoupons = () => {
  const current = getGameState();
  const completed = getCompletedStages();
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

// --- Backwards compatible Completed Stages getters/setters ---
export const getCompletedStages = (): Record<string, boolean> => {
  const current = getGameState();
  const res: Record<string, boolean> = {};
  if (current.completedStages) {
    current.completedStages.forEach(key => {
      res[key] = true;
    });
  }
  return res;
};

export const saveCompletedStage = (stageKey: string) => {
  const current = getGameState();
  const stages = current.completedStages || [];
  if (!stages.includes(stageKey)) {
    const nextStages = [...stages, stageKey];
    updateGameState({ completedStages: nextStages });
  }
};

// --- Supabase Cloud Auth API ---

// Sync Supabase cloud profile down to localStorage
export const syncProfileFromCloud = async (userId: string, username: string) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (data) {
    const stats: UserStats = {
      username: data.username || username,
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      processingSpeed: data.processing_speed ?? 10,
      memoryCapacity: data.memory_capacity ?? 15,
      spatialReasoning: data.spatial_reasoning ?? 10,
      focusControl: data.focus_control ?? 20,
      streak: data.streak ?? 0,
      lastPlayed: data.updated_at || null,
      unlockedCoupons: data.unlocked_coupons || [],
      completedStages: data.completed_stages || [],
    };
    localStorage.setItem(`cog_user_state_${username}`, JSON.stringify(stats));
  } else if (error && error.code === 'PGRST116') {
    // Profile row doesn't exist yet, insert it
    const newStats = { ...DEFAULT_STATS, username };
    const payload = {
      id: userId,
      username,
      level: newStats.level,
      xp: newStats.xp,
      processing_speed: newStats.processingSpeed,
      memory_capacity: newStats.memoryCapacity,
      spatial_reasoning: newStats.spatialReasoning,
      focus_control: newStats.focusControl,
      streak: newStats.streak,
      unlocked_coupons: newStats.unlockedCoupons,
      completed_stages: newStats.completedStages,
    };
    await supabase.from('profiles').insert(payload);
    localStorage.setItem(`cog_user_state_${username}`, JSON.stringify(newStats));
  }
  window.dispatchEvent(new Event('cog_state_updated'));
};

export const signUpUser = async (username: string, email: string, password: string): Promise<{ error: string | null }> => {
  if (!supabase) return { error: 'Database service is currently offline.' };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Registration failed.' };

    localStorage.setItem('cog_active_user', username);
    await syncProfileFromCloud(data.user.id, username);
    return { error: null };
  } catch (e: any) {
    return { error: e.message || 'An unexpected error occurred.' };
  }
};

export const signInUser = async (email: string, password: string): Promise<{ error: string | null }> => {
  if (!supabase) return { error: 'Database service is currently offline.' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Authentication failed.' };

    const username = data.user.user_metadata?.username || email.split('@')[0];
    localStorage.setItem('cog_active_user', username);
    await syncProfileFromCloud(data.user.id, username);
    return { error: null };
  } catch (e: any) {
    return { error: e.message || 'An unexpected error occurred.' };
  }
};

export const signOutUser = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('cog_active_user');
  window.dispatchEvent(new Event('cog_state_updated'));
};

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Guest';
      localStorage.setItem('cog_active_user', username);
      syncProfileFromCloud(session.user.id, username).then();
    } else if (event === 'SIGNED_OUT') {
      localStorage.removeItem('cog_active_user');
      window.dispatchEvent(new Event('cog_state_updated'));
    }
  });
}
