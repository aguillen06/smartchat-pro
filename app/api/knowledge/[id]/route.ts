export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { UpdateKnowledgeDocSchema, validateRequest } from '@/lib/validation';

/**
 * PUT /api/knowledge/[id]
 * Update a knowledge doc (only if owned by authenticated user)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const { id: docId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequest(UpdateKnowledgeDocSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }

    const { title, content } = validation.data;

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

    // Verify the user owns this knowledge doc
    const { data: doc, error: docError } = await supabase
      .from('knowledge_docs')
      .select('widget_id')
      .eq('id', docId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Knowledge doc not found' },
        { status: 404 }
      );
    }

    // Verify the widget belongs to the user
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id')
      .eq('id', doc.widget_id)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this knowledge doc' },
        { status: 403 }
      );
    }

    // Update the knowledge doc
    const { data: updatedDoc, error: updateError } = await supabase
      .from('knowledge_docs')
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating knowledge doc:', updateError);
      return NextResponse.json(
        { error: 'Failed to update knowledge doc' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error('Error in PUT /api/knowledge/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/knowledge/[id]
 * Delete a knowledge doc (only if owned by authenticated user)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const cookieStore = await cookies();
    const { id: docId } = await params;

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

    // Verify the user owns this knowledge doc
    const { data: doc, error: docError } = await supabase
      .from('knowledge_docs')
      .select('widget_id')
      .eq('id', docId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Knowledge doc not found' },
        { status: 404 }
      );
    }

    // Verify the widget belongs to the user
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('owner_id')
      .eq('id', doc.widget_id)
      .eq('owner_id', user.id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this knowledge doc' },
        { status: 403 }
      );
    }

    // Delete the knowledge doc
    const { error: deleteError } = await supabase
      .from('knowledge_docs')
      .delete()
      .eq('id', docId);

    if (deleteError) {
      console.error('Error deleting knowledge doc:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete knowledge doc' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/knowledge/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}