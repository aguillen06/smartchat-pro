export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, getServerSupabase } from '@/lib/auth-server';
import { stripe } from '@/lib/stripe';
import { PRICING_PLANS } from '@/lib/stripe-config';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { planId, billingPeriod = 'monthly' } = await request.json();
    console.log('Checkout request:', { planId, billingPeriod, userId: user.id });

    // Validate plan
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan || planId === 'free') {
      console.error('Invalid plan:', planId);
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Get price ID based on billing period
    // TypeScript now knows plan is not 'free' due to the check above
    const priceId = 'stripePriceId' in plan ? plan.stripePriceId[billingPeriod as 'monthly' | 'yearly'] : undefined;
    console.log('Using price ID:', priceId);
    if (!priceId) {
      console.error('Invalid billing period:', billingPeriod);
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    // Get or create Stripe customer
    const supabase = await getServerSupabase();

    // Check if user already has a subscription record
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId = subscription?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to database with only basic fields
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          plan: 'free',
          status: 'trialing',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (upsertError) {
        console.error('Error saving customer ID:', upsertError);
      }
    }

    // Create checkout session
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`;

    console.log('Creating checkout session with:', {
      customerId: stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing',
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    // Verify Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized!');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_period: billingPeriod,
        },
        subscription_data: {
          trial_period_days: 14, // 14-day free trial
          metadata: {
            user_id: user.id,
            plan_id: planId,
          },
        },
      });

      console.log('Checkout session created successfully:', {
        sessionId: session.id,
        url: session.url ? session.url.substring(0, 50) + '...' : 'NO URL',
        hasUrl: !!session.url
      });

      if (!session.url) {
        console.error('Stripe session created but no URL returned!', session);
        return NextResponse.json(
          { error: 'No checkout URL generated' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sessionId: session.id,
        url: session.url
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Stripe error: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}