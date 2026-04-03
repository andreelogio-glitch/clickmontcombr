import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zwfiadmmfgillrqhlbjw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmlhZG1tZmdpbGxycWhsYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTE3OTcsImV4cCI6MjA4NzYyNzc5N30.xqCG6hExgRWq5uuA8TxIkDlAunQj7NOMr2zEIhVt394';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
