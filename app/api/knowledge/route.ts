export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET /api/knowledge
 * Get all knowledge docs for the authenticated user's widgets
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
      .select('id')
      .eq('owner_id', user.id);

    if (widgetsError) {
      console.error('Error fetching widgets:', widgetsError);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    if (!widgets || widgets.length === 0) {
      return NextResponse.json([]);
    }

    const widgetIds = widgets.map(w => w.id);

    // Get all knowledge docs for user's widgets
    const { data: docs, error } = await supabase
      .from('knowledge_docs')
      .select('*')
      .in('widget_id', widgetIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge docs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge docs' },
        { status: 500 }
      );
    }

    return NextResponse.json(docs || []);
  } catch (error) {
    console.error('Error in GET /api/knowledge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge
 * Create a new knowledge doc for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
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

    // Get user's first widget (or create one if they don't have any)
    const { data: widgets, error: widgetsError } = await supabase
      .from('widgets')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (widgetsError) {
      console.error('Error fetching widgets:', widgetsError);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    let widgetId: string;

    if (!widgets || widgets.length === 0) {
      // Create a default widget for the user
      const { data: newWidget, error: createError } = await supabase
        .from('widgets')
        .insert({
          owner_id: user.id,
          widget_key: `widget_${user.id}_${Date.now()}`,
          settings: {
            theme_color: '#14b8a6',
            welcome_message: 'Hi! How can I help you today?',
            position: 'bottom-right',
            collect_email: true,
            auto_open: false,
            business_name: 'My Business',
            business_description: 'Welcome to our chat support.',
            notification_sound: true,
            working_hours: {
              enabled: false,
              timezone: 'America/New_York',
              schedule: {}
            }
          }
        })
        .select()
        .single();

      if (createError || !newWidget) {
        console.error('Error creating widget:', createError);
        return NextResponse.json(
          { error: 'Failed to create widget' },
          { status: 500 }
        );
      }

      widgetId = newWidget.id;
    } else {
      widgetId = widgets[0].id;
    }

    // Create knowledge doc
    const { data, error } = await supabase
      .from('knowledge_docs')
      .insert({
        widget_id: widgetId,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge doc:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to create knowledge doc', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/knowledge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}