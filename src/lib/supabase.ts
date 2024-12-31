import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://amrleuqngqtfbrjadcky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmxldXFuZ3F0ZmJyamFkY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NTI0MDAsImV4cCI6MjAyNTIyODQwMH0.qA8kHlhJMYwWRGgX7GQ5D4lLn9wKI_dKFRHJQ-lUaXM';

if (!supabaseUrl) {
  throw new Error("Supabase URL is not configured.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is not configured.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);