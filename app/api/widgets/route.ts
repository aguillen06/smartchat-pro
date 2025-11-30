export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

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
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();

    // Get the session token from cookies
    const sessionToken = cookieStore.get('supabase-auth-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the session and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken.value);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's widgets
    const { data: widgets, error: widgetsError } = await supabase
      .from('widgets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (widgetsError) {
      console.error('Error fetching widgets:', widgetsError);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    return NextResponse.json(widgets || []);
  } catch (error) {
    console.error('Error in GET /api/widgets:', error);
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
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const body = await request.json();
    const { name, welcomeMessage, primaryColor, businessDescription } = body;

    // Validate required fields
    if (!name || !welcomeMessage) {
      return NextResponse.json(
        { error: 'Name and welcome message are required' },
        { status: 400 }
      );
    }

    // Get the session token from cookies
    const sessionToken = cookieStore.get('supabase-auth-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the session and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken.value);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate unique widget key
    const widgetKey = generateWidgetKey();

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
      console.error('Error creating widget:', createError);
      return NextResponse.json(
        { error: 'Failed to create widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(widget);
  } catch (error) {
    console.error('Error in POST /api/widgets:', error);
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
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const body = await request.json();
    const { widgetId, name, welcomeMessage, primaryColor, businessDescription, settings } = body;

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    // Get the session token from cookies
    const sessionToken = cookieStore.get('supabase-auth-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the session and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken.value);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user owns this widget
    const { data: existingWidget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id, settings')
      .eq('id', widgetId)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !existingWidget) {
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
      console.error('Error updating widget:', updateError);
      return NextResponse.json(
        { error: 'Failed to update widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedWidget);
  } catch (error) {
    console.error('Error in PUT /api/widgets:', error);
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
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const widgetId = searchParams.get('id');

    if (!widgetId) {
      return NextResponse.json(
        { error: 'Widget ID is required' },
        { status: 400 }
      );
    }

    // Get the session token from cookies
    const sessionToken = cookieStore.get('supabase-auth-token');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the session and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken.value);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the user owns this widget
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id')
      .eq('id', widgetId)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !widget) {
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
      console.error('Error deleting widget:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete widget' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}