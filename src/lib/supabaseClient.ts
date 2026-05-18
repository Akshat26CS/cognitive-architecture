import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

let client: any = null;

try {
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project-id')) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn("Supabase credentials not fully configured. Falling back to local mode.");
  }
} catch (e) {
  console.error("Failed to initialize Supabase client:", e);
}

export const supabase = client;
