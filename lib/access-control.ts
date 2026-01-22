import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Product = 'smartchat' | 'phonebot' | 'automation'
export type TenantStatus = 'pending' | 'trial' | 'active' | 'suspended' | 'cancelled'

interface AccessCheckResult {
  hasAccess: boolean
  reason?: string
  tenant?: {
    id: string
    name: string
    status: TenantStatus
    products: Record<Product, boolean>
    trialEndsAt?: string
  }
}

/**
 * Check if a tenant has access to a specific product
 *
 * @param tenantId - The tenant UUID
 * @param product - The product to check access for
 * @returns Access check result with details
 */
export async function checkProductAccess(
  tenantId: string,
  product: Product
): Promise<AccessCheckResult> {
  if (!tenantId) {
    return {
      hasAccess: false,
      reason: 'No tenant ID provided',
    }
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, name, status, products, trial_ends_at')
    .eq('id', tenantId)
    .single()

  if (error || !tenant) {
    return {
      hasAccess: false,
      reason: 'Tenant not found',
    }
  }

  // Check tenant status
  const validStatuses: TenantStatus[] = ['active', 'trial']
  if (!validStatuses.includes(tenant.status as TenantStatus)) {
    return {
      hasAccess: false,
      reason: `Account status is ${tenant.status}`,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status as TenantStatus,
        products: tenant.products || {},
        trialEndsAt: tenant.trial_ends_at,
      },
    }
  }

  // Check if trial has expired
  if (tenant.status === 'trial' && tenant.trial_ends_at) {
    const trialEnd = new Date(tenant.trial_ends_at)
    if (trialEnd < new Date()) {
      return {
        hasAccess: false,
        reason: 'Trial period has expired',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          status: tenant.status as TenantStatus,
          products: tenant.products || {},
          trialEndsAt: tenant.trial_ends_at,
        },
      }
    }
  }

  // Check product access
  const products = tenant.products || {}
  if (products[product] !== true) {
    return {
      hasAccess: false,
      reason: `No ${product} subscription`,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status as TenantStatus,
        products: products,
        trialEndsAt: tenant.trial_ends_at,
      },
    }
  }

  return {
    hasAccess: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      status: tenant.status as TenantStatus,
      products: products,
      trialEndsAt: tenant.trial_ends_at,
    },
  }
}

/**
 * Grant product access to a tenant
 */
export async function grantProductAccess(
  tenantId: string,
  product: Product
): Promise<boolean> {
  const { data: tenant, error: fetchError } = await supabase
    .from('tenants')
    .select('products')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant) {
    return false
  }

  const products = tenant.products || {}
  products[product] = true

  const { error: updateError } = await supabase
    .from('tenants')
    .update({ products })
    .eq('id', tenantId)

  return !updateError
}

/**
 * Revoke product access from a tenant
 */
export async function revokeProductAccess(
  tenantId: string,
  product: Product
): Promise<boolean> {
  const { data: tenant, error: fetchError } = await supabase
    .from('tenants')
    .select('products')
    .eq('id', tenantId)
    .single()

  if (fetchError || !tenant) {
    return false
  }

  const products = tenant.products || {}
  products[product] = false

  const { error: updateError } = await supabase
    .from('tenants')
    .update({ products })
    .eq('id', tenantId)

  return !updateError
}

/**
 * Update tenant status
 */
export async function updateTenantStatus(
  tenantId: string,
  status: TenantStatus
): Promise<boolean> {
  const { error } = await supabase
    .from('tenants')
    .update({ status })
    .eq('id', tenantId)

  return !error
}

/**
 * Get all tenants for a user (by auth_user_id)
 */
export async function getTenantForUser(authUserId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      tenant:tenants (
        id,
        name,
        slug,
        business_name,
        status,
        products,
        trial_ends_at
      )
    `)
    .eq('auth_user_id', authUserId)
    .single()

  if (error || !user) {
    return null
  }

  return user
}
