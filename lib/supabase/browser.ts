import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client for authentication
// Uses the anon key (safe for browser) instead of service role key
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
