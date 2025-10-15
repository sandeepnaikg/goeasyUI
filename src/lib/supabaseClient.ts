import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lightweight wrapper that gracefully returns null when env is not configured
let supabase: SupabaseClient | null = null;
try {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && anon) {
    supabase = createClient(url, anon);
  }
} catch {
  supabase = null;
}

export function getSupabase() {
  return supabase;
}
