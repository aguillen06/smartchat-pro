import { createClient } from '@supabase/supabase-js'

// Simple in-memory cache for tenant resolution
const tenantCache = new Map<string, { id: string; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Resolve a tenant slug or ID to the actual tenant UUID
 * Supports both slugs (human-readable) and UUIDs
 *
 * @param slugOrId - Either a tenant slug (e.g., "acme-corp-123") or UUID
 * @returns The tenant UUID if found, null otherwise
 */
export async function resolveTenantId(slugOrId: string): Promise<string | null> {
  if (!slugOrId) {
    return null
  }

  // Check if it's already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(slugOrId)) {
    // Verify the UUID exists in the database
    const cached = tenantCache.get(slugOrId)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.id
    }

    const { data } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', slugOrId)
      .single()

    if (data) {
      tenantCache.set(slugOrId, { id: data.id, expiresAt: Date.now() + CACHE_TTL })
      return data.id
    }
    return null
  }

  // Check cache for slug
  const cached = tenantCache.get(slugOrId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.id
  }

  // Query by slug
  const { data } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slugOrId)
    .single()

  if (data) {
    // Cache the result
    tenantCache.set(slugOrId, { id: data.id, expiresAt: Date.now() + CACHE_TTL })
    return data.id
  }

  return null
}

/**
 * Get tenant details by slug or ID
 */
export async function getTenantDetails(slugOrId: string) {
  const tenantId = await resolveTenantId(slugOrId)

  if (!tenantId) {
    return null
  }

  const { data } = await supabase
    .from('tenants')
    .select('id, name, slug, business_name, status, products, settings')
    .eq('id', tenantId)
    .single()

  return data
}

/**
 * Check if a tenant has access to a specific product
 */
export async function checkTenantProductAccess(
  slugOrId: string,
  product: 'smartchat' | 'phonebot'
): Promise<boolean> {
  const tenant = await getTenantDetails(slugOrId)

  if (!tenant) {
    return false
  }

  // Check tenant status
  if (tenant.status !== 'active' && tenant.status !== 'trial') {
    return false
  }

  // Check product access
  return tenant.products?.[product] === true
}

/**
 * Clear tenant cache (useful for testing or after tenant updates)
 */
export function clearTenantCache(slugOrId?: string) {
  if (slugOrId) {
    tenantCache.delete(slugOrId)
  } else {
    tenantCache.clear()
  }
}
