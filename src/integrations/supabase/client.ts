import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://mmfsgzsvhktcyflarlae.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2UiLCJyZWYiOiJtbWZzZ3pzdmhrdGN5ZmxhcmxhZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcyMDUzNjQ0LCJleHAiOjIwODc2Mjk2NDR9.sw61EZza4jmyvy51RLUyKiBJ3p6GXjs_NsnZKAnn2TI';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
