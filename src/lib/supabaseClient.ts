import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

let client: any = null;

try {
  console.log("[Supabase Config Status] URL Loaded:", supabaseUrl ? "YES" : "NO", "| Key Loaded:", supabaseAnonKey ? "YES" : "NO");
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project-id')) {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[Supabase Status] Client initialized successfully!");
  } else {
    console.warn("[Supabase Status] Credentials not fully configured. Running in local fallback mode.");
  }
} catch (e) {
  console.error("[Supabase Status] Failed to initialize client:", e);
}

export const supabase = client;
