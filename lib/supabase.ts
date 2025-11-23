import { createClient } from '@supabase/supabase-js';

/**
 * Supabase URL from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase anonymous key for client-side operations
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase service role key for server-side admin operations
 */
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/**
 * Supabase client for browser/client-side operations
 * Uses the anonymous key with row-level security
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase admin client for server-side operations
 * Uses the service role key to bypass row-level security
 * WARNING: Only use this in API routes or server components
 */
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not found. Admin client will not be available.'
    );
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

/**
 * Type-safe helper to ensure admin client is available
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase admin client is not available. Please set SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return supabaseAdmin;
}
