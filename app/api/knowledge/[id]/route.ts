import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * PUT /api/knowledge/[id]
 * Update a knowledge doc
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('knowledge_docs')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge doc:', error);
      return NextResponse.json(
        { error: 'Failed to update knowledge doc' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Knowledge doc not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
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
 * Delete a knowledge doc
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('knowledge_docs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge doc:', error);
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
