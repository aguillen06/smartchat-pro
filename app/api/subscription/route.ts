import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription with usage data
    const supabase = await getServerSupabase();

    // Get subscription directly from table
    let { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no subscription exists, create a free trial
    if (!subscription) {
      const { data: newSub, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: 'free',
          status: 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating subscription:', createError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      subscription = newSub;
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('conversation_count, widget_count')
      .eq('user_id', user.id)
      .eq('period_start', subscription.current_period_start)
      .single();

    // Get actual widget count
    const { count: widgetCount } = await supabase
      .from('widgets')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('is_active', true);

    // Determine limits based on plan
    let conversationLimit = 100;
    let widgetLimit = 1;

    switch (subscription.plan) {
      case 'starter':
        conversationLimit = 1000;
        widgetLimit = 1;
        break;
      case 'pro':
        conversationLimit = 5000;
        widgetLimit = 3;
        break;
    }

    return NextResponse.json({
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      current_conversation_count: usage?.conversation_count || 0,
      current_widget_count: widgetCount || 0,
      conversation_limit: conversationLimit,
      widget_limit: widgetLimit,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}