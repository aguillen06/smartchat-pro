import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for browser/client components
 * Uses the anon key for authenticated user operations
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
