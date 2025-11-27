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
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    console.log('Updating knowledge doc:', id);

    const { data, error } = await supabase
      .from('knowledge_docs')
      .update({
        title: title.trim(),
        content: content.trim(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating knowledge doc:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to update knowledge doc', details: error },
        { status: 500 }
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
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    console.log('Deleting knowledge doc:', id);

    const { error } = await supabase
      .from('knowledge_docs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge doc:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to delete knowledge doc', details: error },
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
