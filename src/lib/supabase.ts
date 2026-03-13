import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
    throw new Error('SECURE-FAIL: DO NOT IMPORT THIS CLIENT-SIDE. The Service Role key bypasses all RLS.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a single supabase client for interacting with your database
// Only instantiate if credentials exist to prevent hard crashes before Vercel env vars are injected
export const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;
