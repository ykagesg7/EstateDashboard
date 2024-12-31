import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL が設定されていません。");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY が設定されていません。");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);