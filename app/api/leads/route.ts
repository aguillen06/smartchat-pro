export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * GET /api/leads
 * Get all leads for the authenticated user's widgets
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

    // Get all leads for user's widgets
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
      .in('widget_id', widgetIds)
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
 * Create a new lead (called from widget, not dashboard)
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