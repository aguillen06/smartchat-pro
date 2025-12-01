import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { WEBHOOK_EVENTS } from '@/lib/stripe-config';
import Stripe from 'stripe';

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Check if webhook secret is configured
  if (!webhookSecret || webhookSecret === 'whsec_placeholder_for_now') {
    if (process.env.NODE_ENV === 'production') {
      // In production, webhook secret MUST be configured
      console.error('❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not configured in production!');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    // Development mode - skip verification but warn
    console.warn('⚠️ Webhook signature verification skipped in development');
    console.warn('⚠️ Set STRIPE_WEBHOOK_SECRET for production security');
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err) {
      console.error('Failed to parse webhook body:', err);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  } else {
    // Verify webhook signature (required for production)
    if (!signature) {
      console.error('🔒 Webhook signature missing from request headers');
      return NextResponse.json({ error: 'Webhook signature required' }, { status: 401 });
    }

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log('✅ Webhook signature verified successfully');
    } catch (err: any) {
      console.error('🔒 Webhook signature verification failed:', {
        error: err.message,
        type: err.type,
        signature: signature?.substring(0, 20) + '...'
      });
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 401 }
      );
    }
  }

  const supabase = getSupabaseAdmin();

  console.log(`📥 Webhook received: ${event.type}`, { id: event.id });

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED: {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          // Handle new subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const userId = session.metadata?.user_id;
          const planId = session.metadata?.plan_id || 'starter';

          if (!userId) {
            console.error('No user_id in checkout session metadata');
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
          }

          // Update subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              plan: planId,
              status: subscription.status,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
            });

          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }

          console.log('Subscription created for user:', userId);
        }
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED: {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user ID from customer
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!subData) {
          console.error('No user found for customer:', customerId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine plan from price ID
        let planId = 'free';
        const priceId = subscription.items.data[0]?.price.id;

        // Map actual Stripe price IDs to plans
        if (priceId === 'price_1SYIeeL0OvBwJPE63VNTk5VC') {
          planId = 'starter'; // Starter monthly
        } else if (priceId === 'price_1SYIe6L0OvBwJPE6rBPoqm3H') {
          planId = 'pro'; // Pro monthly
        } else if (priceId?.includes('starter')) {
          planId = 'starter'; // Fallback for yearly prices
        } else if (priceId?.includes('pro')) {
          planId = 'pro'; // Fallback for yearly prices
        }

        // Update subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            plan: planId,
            status: subscription.status,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }

        console.log('Subscription updated:', subscription.id);
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error canceling subscription:', error);
          throw error;
        }

        console.log('Subscription canceled:', subscription.id);
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED: {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);

        // Reset usage for new billing period
        const customerId = invoice.customer as string;
        const subscription = invoice.subscription as string;

        if (subscription) {
          // Get subscription details
          const sub = await stripe.subscriptions.retrieve(subscription);

          // Get user from customer ID
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (subData) {
            // Create or update usage tracking for new period
            const { error } = await supabase
              .from('usage_tracking')
              .upsert({
                user_id: subData.user_id,
                period_start: new Date(sub.current_period_start * 1000).toISOString(),
                period_end: new Date(sub.current_period_end * 1000).toISOString(),
                conversation_count: 0,
                widget_count: 0,
              });

            if (error) {
              console.error('Error resetting usage:', error);
            }
          }
        }
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Update subscription status
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating subscription status:', error);
        }

        console.log('Payment failed for invoice:', invoice.id);

        // TODO: Send email notification to user
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}