import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are defined
const supabaseUrl = 'https://amrleuqngqtfbrjadcky.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmxldXFuZ3F0ZmJyamFkY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MzI1NzAsImV4cCI6MjAyNTIwODU3MH0.Ij0rqgqT6oUmYQGQj_hGIEGYy_8Uj_qEWGtHXt4YC7g'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)