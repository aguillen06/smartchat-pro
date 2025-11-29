export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getServerUser } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session ID from request
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log('Verifying checkout session:', sessionId);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    console.log('Session retrieved:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return NextResponse.json({
        error: 'Payment not completed',
        payment_status: session.payment_status
      }, { status: 400 });
    }

    // Get subscription details
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Fetch full subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    console.log('Subscription details:', {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.items.data[0]?.price.id
    });

    // Determine plan from price ID
    const priceId = subscription.items.data[0]?.price.id;
    let planId = 'free';

    // Map price IDs to plans (using the actual price IDs from config)
    if (priceId === 'price_1SYIeeL0OvBwJPE63VNTk5VC') {
      planId = 'starter'; // Starter monthly
    } else if (priceId === 'price_1SYIe6L0OvBwJPE6rBPoqm3H') {
      planId = 'pro'; // Pro monthly
    } else if (priceId?.includes('starter')) {
      planId = 'starter'; // Fallback for yearly prices
    } else if (priceId?.includes('pro')) {
      planId = 'pro'; // Fallback for yearly prices
    }

    // Update subscription in database with only basic fields
    const supabase = getSupabaseAdmin();

    // First, try to insert/update with minimal fields that should exist
    // Handle customer ID - it might be expanded or just a string
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;

    const subscriptionData = {
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan: planId,
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to upsert subscription with data:', subscriptionData);

    const { data: updatedSub, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'  // Upsert based on user_id since each user has one subscription
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription - Full details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        data: subscriptionData
      });
      return NextResponse.json({
        error: 'Failed to update subscription',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    console.log('Subscription updated successfully:', updatedSub);

    // Also create/update usage tracking for the new period
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: user.id,
        period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        conversation_count: 0,
        widget_count: 0,
        updated_at: new Date().toISOString()
      });

    if (usageError) {
      console.error('Error updating usage tracking:', usageError);
      // Non-fatal error, continue
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
      plan: planId
    });

  } catch (error: any) {
    console.error('Session verification error - Full details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      type: error?.type,
      code: error?.code
    });
    return NextResponse.json(
      {
        error: 'Failed to verify session',
        details: error?.message || 'Unknown error occurred',
        type: error?.type || 'unknown'
      },
      { status: 500 }
    );
  }
}