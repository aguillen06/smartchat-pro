/**
 * Browser-only Supabase client
 * Safe to use in client components and auth pages
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY (not the service role key)
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/**
 * Create browser-compatible Supabase client for client components
 * This properly handles auth cookies and sessions
 * Use this for all auth operations in client components
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
