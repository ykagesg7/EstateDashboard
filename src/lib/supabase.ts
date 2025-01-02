import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const supabaseUrl = 'https://amrleuqngqtfbrjadcky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmxldXFuZ3F0ZmJyamFkY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxNjAxODMsImV4cCI6MjA0MDczNjE4M30.W6eSJuFudqJ5sZJ0BeauHzODvpqhFNLMWDkgJIevV-8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage
  }
});