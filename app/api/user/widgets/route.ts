import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user-scoped Supabase client
    const supabase = await getServerSupabase();

    // Fetch user's widgets
    const { data: widgets, error } = await supabase
      .from('widgets')
      .select('id, widget_key, welcome_message, primary_color, ai_instructions')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching widgets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch widgets' },
        { status: 500 }
      );
    }

    return NextResponse.json(widgets || []);
  } catch (error) {
    console.error('Error in /api/user/widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
