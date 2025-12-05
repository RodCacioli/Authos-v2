import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in Vite
const getEnv = (key: string) => {
  // Vite uses import.meta.env. The (import.meta as any) cast avoids TS errors if types aren't fully set up.
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

// If the keys are missing (like when you first start), we use placeholders so the app doesn't crash immediately.
// This allows the UI to render the "Setup" instructions instead of a white screen error.
const finalUrl = supabaseUrl ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey ? supabaseAnonKey : 'placeholder';

if (!supabaseUrl) {
    console.warn("Supabase URL missing. Auth will not work until you add VITE_SUPABASE_URL to .env");
}

export const supabase = createClient(finalUrl, finalKey);