import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Types for user with tenant context
export interface UserWithTenant {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  role: string
  tenant: {
    id: string
    name: string
    slug: string
    businessName?: string | null
    status: string
    products: {
      smartchat: boolean
      phonebot: boolean
    }
  }
}

/**
 * Create a Supabase client for server components and API routes
 * Handles cookie management for auth sessions
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component
            // This can be ignored if you have middleware refreshing user sessions
          }
        },
      },
    }
  )
}

/**
 * Create an admin Supabase client with service role key
 * Use this for operations that bypass RLS (webhooks, admin operations)
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get the current authenticated user with tenant context
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserWithTenant | null> {
  const supabase = await createServerSupabaseClient()

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return null
  }

  // Get user record with tenant data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      role,
      tenant:tenants (
        id,
        name,
        slug,
        business_name,
        status,
        products
      )
    `)
    .eq('auth_user_id', authUser.id)
    .single()

  if (userError || !userData) {
    console.error('Failed to get user data:', userError)
    return null
  }

  // Handle case where tenant is an array (Supabase returns array for relations)
  const tenant = Array.isArray(userData.tenant) ? userData.tenant[0] : userData.tenant

  if (!tenant) {
    console.error('User has no tenant')
    return null
  }

  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    role: userData.role || 'owner',
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      businessName: tenant.business_name,
      status: tenant.status,
      products: tenant.products || { smartchat: false, phonebot: false },
    },
  }
}

/**
 * Get the authenticated user's session
 * Returns null if not authenticated
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Session error:', error)
    return null
  }

  return session
}

/**
 * Check if user has access to a specific product
 */
export async function checkProductAccess(product: 'smartchat' | 'phonebot'): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  // Check tenant status
  if (user.tenant.status !== 'active' && user.tenant.status !== 'trial') {
    return false
  }

  // Check product access
  return user.tenant.products[product] === true
}

/**
 * Generate a URL-safe slug from a business name
 */
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36)
}
