import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, settings } = await request.json()

    if (!tenantId || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Verify tenant exists and get current settings
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, settings')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Merge new widget settings with existing settings
    const currentSettings = tenant.settings || {}
    const updatedSettings = {
      ...currentSettings,
      widget: {
        ...currentSettings.widget,
        ...settings,
        updatedAt: new Date().toISOString(),
      },
    }

    // Update tenant settings
    const { error: updateError } = await supabase
      .from('tenants')
      .update({ settings: updatedSettings })
      .eq('id', tenantId)

    if (updateError) {
      console.error('Failed to update widget settings:', updateError)
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings.widget,
    })
  } catch (error) {
    console.error('Widget settings error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single()

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      settings: tenant.settings?.widget || {},
    })
  } catch (error) {
    console.error('Get widget settings error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
