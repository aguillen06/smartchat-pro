import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { UpdateWidgetByKeySchema, validateRequest } from '@/lib/validation';

/**
 * GET /api/widgets/[key]
 * Get widget settings by widget key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    console.log('🔍 [Widget API GET] Received params - key:', key);

    const supabase = getSupabaseAdmin();

    const { data: widget, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('widget_key', key)
      .single();

    console.log('🔍 [Widget API GET] Supabase result:', { widget, error });

    if (error || !widget) {
      console.error('❌ [Widget API GET] Widget not found. Error:', error);
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    console.log('✅ [Widget API GET] Widget found:', widget.id);
    return NextResponse.json(widget);
  } catch (error) {
    console.error('Error fetching widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/widgets/[key]
 * Update widget settings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const supabase = getSupabaseAdmin();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(UpdateWidgetByKeySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    // First get the widget ID
    const { data: widget, error: fetchError } = await supabase
      .from('widgets')
      .select('id')
      .eq('widget_key', key)
      .single();

    if (fetchError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Update the widget
    const { data, error } = await supabase
      .from('widgets')
      .update({
        name: validation.data.name,
        welcome_message: validation.data.welcome_message,
        primary_color: validation.data.primary_color,
        ai_instructions: validation.data.ai_instructions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', widget.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating widget:', error);
      return NextResponse.json(
        { error: 'Failed to update widget' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
