export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';

/**
 * Generate a unique widget key
 */
function generateWidgetKey(): string {
  const randomString = Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15);
  return `widget_${randomString}`;
}

/**
 * GET /api/widgets
 * Get all widgets for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/widgets] Starting request');

    // Get authenticated user using the server helper
    const user = await getServerUser();
    console.log('[GET /api/widgets] User:', user?.id, user?.email);

    if (!user) {
      console.log('[GET /api/widgets] No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to query (bypasses RLS)
    const supabase = getSupabaseAdmin();

    // Get user's widgets
    const { data: widgets, error: widgetsError } = await supabase
      .from('widgets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (widgetsError) {
      console.error('[GET /api/widgets] Error fetching widgets:', widgetsError);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    console.log('[GET /api/widgets] Found widgets:', widgets?.length || 0);
    return NextResponse.json(widgets || []);
  } catch (error) {
    console.error('[GET /api/widgets] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/widgets
 * Create a new widget for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/widgets] Starting request');

    const body = await request.json();
    const { name, welcomeMessage, primaryColor, businessDescription } = body;
    console.log('[POST /api/widgets] Request body:', { name, welcomeMessage, primaryColor, hasBusinessDescription: !!businessDescription });

    // Validate required fields
    if (!name || !welcomeMessage) {
      console.log('[POST /api/widgets] Missing required fields');
      return NextResponse.json(
        { error: 'Name and welcome message are required' },
        { status: 400 }
      );
    }

    // Get authenticated user using the server helper
    const user = await getServerUser();
    console.log('[POST /api/widgets] User:', user?.id, user?.email);

    if (!user) {
      console.log('[POST /api/widgets] No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a widget' },
        { status: 401 }
      );
    }

    // Generate unique widget key
    const widgetKey = generateWidgetKey();
    console.log('[POST /api/widgets] Generated widget key:', widgetKey);

    // Create widget settings object
    const settings = {
      theme_color: primaryColor || '#0D9488',
      welcome_message: welcomeMessage.trim(),
      position: 'bottom-right',
      collect_email: true,
      auto_open: false,
      business_name: name.trim(),
      business_description: businessDescription?.trim() || '',
      notification_sound: true,
      working_hours: {
        enabled: false,
        timezone: 'America/New_York',
        schedule: {}
      }
    };

    // Use admin client to create widget (bypasses RLS)
    const supabase = getSupabaseAdmin();

    // Create the widget
    const { data: widget, error: createError } = await supabase
      .from('widgets')
      .insert({
        owner_id: user.id,
        widget_key: widgetKey,
        name: name.trim(),
        settings: settings,
      })
      .select()
      .single();

    if (createError) {
      console.error('[POST /api/widgets] Error creating widget:', createError);
      console.error('[POST /api/widgets] Error details:', JSON.stringify(createError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create widget', details: createError },
        { status: 500 }
      );
    }

    console.log('[POST /api/widgets] Widget created successfully:', widget?.id);
    return NextResponse.json(widget);
  } catch (error) {
    console.error('[POST /api/widgets] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/widgets
 * Update a widget (authenticated, owner only)
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('[PUT /api/widgets] Starting request');

    const body = await request.json();
    const { widgetId, name, welcomeMessage, primaryColor, businessDescription, settings } = body;

    if (!widgetId) {
      console.log('[PUT /api/widgets] Missing widget ID');
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user using the server helper
    const user = await getServerUser();
    console.log('[PUT /api/widgets] User:', user?.id, user?.email);

    if (!user) {
      console.log('[PUT /api/widgets] No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to query and update (bypasses RLS)
    const supabase = getSupabaseAdmin();

    // Verify the user owns this widget
    const { data: existingWidget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id, settings')
      .eq('id', widgetId)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !existingWidget) {
      console.log('[PUT /api/widgets] Widget not found or unauthorized');
      return NextResponse.json(
        { error: 'Widget not found or unauthorized' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Merge settings if provided, or build from individual fields
    if (settings) {
      updateData.settings = {
        ...existingWidget.settings,
        ...settings,
      };
    } else {
      const newSettings: any = { ...existingWidget.settings };

      if (welcomeMessage !== undefined) {
        newSettings.welcome_message = welcomeMessage.trim();
      }
      if (primaryColor !== undefined) {
        newSettings.theme_color = primaryColor;
      }
      if (businessDescription !== undefined) {
        newSettings.business_description = businessDescription.trim();
      }
      if (name !== undefined) {
        newSettings.business_name = name.trim();
      }

      updateData.settings = newSettings;
    }

    // Update the widget
    const { data: updatedWidget, error: updateError } = await supabase
      .from('widgets')
      .update(updateData)
      .eq('id', widgetId)
      .select()
      .single();

    if (updateError) {
      console.error('[PUT /api/widgets] Error updating widget:', updateError);
      return NextResponse.json(
        { error: 'Failed to update widget' },
        { status: 500 }
      );
    }

    console.log('[PUT /api/widgets] Widget updated successfully');
    return NextResponse.json(updatedWidget);
  } catch (error) {
    console.error('[PUT /api/widgets] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/widgets
 * Delete a widget (authenticated, owner only)
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('[DELETE /api/widgets] Starting request');

    const { searchParams } = new URL(request.url);
    const widgetId = searchParams.get('id');

    if (!widgetId) {
      console.log('[DELETE /api/widgets] Missing widget ID');
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user using the server helper
    const user = await getServerUser();
    console.log('[DELETE /api/widgets] User:', user?.id, user?.email);

    if (!user) {
      console.log('[DELETE /api/widgets] No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client to query and delete (bypasses RLS)
    const supabase = getSupabaseAdmin();

    // Verify the user owns this widget
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id')
      .eq('id', widgetId)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !widget) {
      console.log('[DELETE /api/widgets] Widget not found or unauthorized');
      return NextResponse.json(
        { error: 'Widget not found or unauthorized' },
        { status: 403 }
      );
    }

    // Delete the widget (cascading deletes should handle related records)
    const { error: deleteError } = await supabase
      .from('widgets')
      .delete()
      .eq('id', widgetId);

    if (deleteError) {
      console.error('[DELETE /api/widgets] Error deleting widget:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete widget' },
        { status: 500 }
      );
    }

    console.log('[DELETE /api/widgets] Widget deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/widgets] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}