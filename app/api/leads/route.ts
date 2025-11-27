import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/leads?widgetKey=xxx
 * Get all leads for a widget
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

    // Get all leads with conversation info
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        conversations:conversation_id (
          id,
          visitor_id,
          started_at
        )
      `)
      .eq('widget_id', widget.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json(leads || []);
  } catch (error) {
    console.error('Error in GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { conversationId, widgetId, name, email, phone, source = 'chat_prompt' } = body;

    if (!conversationId || !widgetId) {
      return NextResponse.json(
        { error: 'conversationId and widgetId are required' },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'At least email or phone is required' },
        { status: 400 }
      );
    }

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        conversation_id: conversationId,
        widget_id: widgetId,
        name: name || null,
        email: email || null,
        phone: phone || null,
        source,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Update conversation to mark lead as captured
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ lead_captured: true })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation lead_captured flag:', updateError);
      // Don't fail the request, lead was still created
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
