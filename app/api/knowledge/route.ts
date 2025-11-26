import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/knowledge?widgetKey=xxx
 * Get all knowledge docs for a widget
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const widgetKey = searchParams.get('widgetKey');

    if (!widgetKey) {
      return NextResponse.json(
        { error: 'widgetKey is required' },
        { status: 400 }
      );
    }

    // Get widget ID
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id')
      .eq('widget_key', widgetKey)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Get all knowledge docs
    const { data: docs, error } = await supabase
      .from('knowledge_docs')
      .select('*')
      .eq('widget_id', widget.id)
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
 * Create a new knowledge doc
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { widgetKey, title, content } = body;

    if (!widgetKey || !title || !content) {
      return NextResponse.json(
        { error: 'widgetKey, title, and content are required' },
        { status: 400 }
      );
    }

    // Get widget ID
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id')
      .eq('widget_key', widgetKey)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    // Create knowledge doc
    const { data, error } = await supabase
      .from('knowledge_docs')
      .insert({
        widget_id: widget.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating knowledge doc:', error);
      return NextResponse.json(
        { error: 'Failed to create knowledge doc' },
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
