import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ CRITICAL: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env');
    // We do NOT throw here consistently, as it breaks the entire app load.
    // Instead we trust the developer to see the console error.
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
