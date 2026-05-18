import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const envUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Direct secure fallbacks for mobile sandboxes where environment variables are cached/blocked
const supabaseUrl = envUrl || 'https://wqpeyizyizynpagftjnz.supabase.co';
const supabaseAnonKey = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcGV5aXp5aXp5bnBhZ2Z0am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDE4NTEsImV4cCI6MjA5NDY3Nzg1MX0.LO_Vg4xZtb6dV-nmK6hzuPht8j0vhvaiXpZhQiZFL0Q';

let client: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[Supabase Status] Client initialized successfully!");
  } else {
    console.warn("[Supabase Status] Credentials not fully configured. Running in local fallback mode.");
  }
} catch (e) {
  console.error("[Supabase Status] Failed to initialize client:", e);
}

export const supabase = client;
