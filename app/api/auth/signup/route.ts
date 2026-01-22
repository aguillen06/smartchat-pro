import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { authUserId, email, businessName, slug } = await request.json()

    if (!authUserId || !email || !businessName || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Check if slug is already taken
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Business name already taken. Please choose another.' },
        { status: 409 }
      )
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: businessName,
        slug,
        business_name: businessName,
        status: 'pending',
        products: { smartchat: false, phonebot: false },
        settings: {},
        timezone: 'America/Chicago',
        language: 'en',
      })
      .select('id')
      .single()

    if (tenantError) {
      console.error('Failed to create tenant:', tenantError)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // Create user linked to auth user and tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        auth_user_id: authUserId,
        tenant_id: tenant.id,
        role: 'owner',
      })
      .select('id')
      .single()

    if (userError) {
      console.error('Failed to create user:', userError)
      // Rollback tenant creation
      await supabase.from('tenants').delete().eq('id', tenant.id)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tenantId: tenant.id,
      userId: user.id,
      slug,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
