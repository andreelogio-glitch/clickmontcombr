import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Projeto correto: txtwmvwuhwpykbqbvhdo
// Env vars definidas na Vercel substituem estes valores em produção
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://txtwmvwuhwpykbqbvhdo.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dHdtdnd1aHdweWticWJ2aGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDE2NzEsImV4cCI6MjA5MDI3NzY3MX0.z-1Ko7c6A4gH1O78Nqrx_LT5yiq3rU_-5bNIWEl2Pgw';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
    },
});
