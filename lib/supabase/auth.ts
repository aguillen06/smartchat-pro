// Re-export from split modules for convenience
// Use @/lib/supabase/browser for client components
// Use @/lib/supabase/server for server components and API routes

export { createBrowserSupabaseClient } from './browser'
export {
  createServerSupabaseClient,
  createAdminSupabaseClient,
  getCurrentUser,
  getSession,
  checkProductAccess,
  generateSlug,
  type UserWithTenant,
} from './server'
