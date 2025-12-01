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

  // Log service role key status for debugging RLS issues
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('🔑 Service role key status:', {
    exists: !!serviceRoleKey,
    length: serviceRoleKey?.length || 0,
    startsWidth: serviceRoleKey?.substring(0, 7) || 'missing',
  });

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

  console.log(`📥 Webhook received: ${event.type}`, {
    id: event.id,
    livemode: event.livemode,
    created: new Date(event.created * 1000).toISOString()
  });

  try {
    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED: {
        try {
          console.log('🛒 Processing checkout.session.completed');
          const session = event.data.object as Stripe.Checkout.Session;

          console.log('📋 Session details:', {
            id: session.id,
            mode: session.mode,
            customer: session.customer,
            subscription: session.subscription,
            metadata: session.metadata
          });

          if (session.mode === 'subscription') {
            // Handle new subscription
            if (!session.subscription) {
              console.error('❌ No subscription ID in session');
              break;
            }

            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );

            const userId = session.metadata?.user_id;
            const planId = session.metadata?.plan_id || 'starter';

            if (!userId) {
              console.error('❌ No user_id in checkout session metadata');
              console.error('Session metadata:', session.metadata);
              // Don't fail the webhook, just log and continue
              break;
            }

            // Ensure we have required fields with proper null checks
            const subscriptionData = {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price?.id || 'unknown',
              plan: planId,
              status: subscription.status,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
              current_period_start: subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : new Date().toISOString(),
              // Note: cancel_at column removed - track via canceled_at instead
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
            };

            console.log('💾 Upserting subscription data:', subscriptionData);

            // Update subscription in database
            const { error } = await supabase
              .from('subscriptions')
              .upsert(subscriptionData);

            if (error) {
              console.error('❌ Database error updating subscription:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              // Don't throw, just log the error
            } else {
              console.log('✅ Subscription created/updated for user:', userId);
            }
          }
        } catch (err) {
          console.error('❌ Error in CHECKOUT_COMPLETED handler:', err);
          console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack');
        }
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED: {
        try {
          console.log(`🔄 Processing ${event.type}`);
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          console.log('📋 Subscription details:', {
            id: subscription.id,
            customer: customerId,
            status: subscription.status,
            items: subscription.items.data.length
          });

          // Get user ID from customer
          const { data: subData, error: lookupError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (lookupError || !subData) {
            console.error('⚠️ No existing subscription found for customer:', customerId);
            console.error('Lookup error:', lookupError);
            // This might be a new customer, don't fail the webhook
            break;
          }

          // Determine plan from price ID
          let planId = 'free';
          const priceId = subscription.items.data[0]?.price?.id;

          if (priceId) {
            console.log('💰 Price ID:', priceId);
            // Map actual Stripe price IDs to plans
            if (priceId === 'price_1SYIeeL0OvBwJPE63VNTk5VC') {
              planId = 'starter'; // Starter monthly
            } else if (priceId === 'price_1SYIe6L0OvBwJPE6rBPoqm3H') {
              planId = 'pro'; // Pro monthly
            } else if (priceId.includes('starter')) {
              planId = 'starter'; // Fallback for yearly prices
            } else if (priceId.includes('pro')) {
              planId = 'pro'; // Fallback for yearly prices
            }
          } else {
            console.warn('⚠️ No price ID found in subscription items');
          }

          // Prepare update data with proper null checks
          const updateData = {
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId || 'unknown',
            plan: planId,
            status: subscription.status,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : new Date().toISOString(),
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : new Date().toISOString(),
            // Note: cancel_at column removed - track via canceled_at instead
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          };

          console.log('💾 Updating subscription data:', updateData);

          // Update subscription
          const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('❌ Database error updating subscription:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // Don't throw, just log the error
          } else {
            console.log('✅ Subscription updated:', subscription.id);
          }
        } catch (err) {
          console.error(`❌ Error in ${event.type} handler:`, err);
          console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack');
        }
        break;
      }

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED: {
        try {
          console.log('🗑️ Processing subscription.deleted');
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          console.log('📋 Deleted subscription:', {
            id: subscription.id,
            customer: customerId
          });

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
            console.error('❌ Database error canceling subscription:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // Don't throw, just log the error
          } else {
            console.log('✅ Subscription canceled:', subscription.id);
          }
        } catch (err) {
          console.error('❌ Error in SUBSCRIPTION_DELETED handler:', err);
          console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack');
        }
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED: {
        try {
          console.log('💰 Processing invoice.payment_succeeded');
          const invoice = event.data.object as Stripe.Invoice;
          console.log('📋 Invoice details:', {
            id: invoice.id,
            customer: invoice.customer,
            subscription: invoice.subscription,
            amount_paid: invoice.amount_paid
          });

          // Reset usage for new billing period
          const customerId = invoice.customer as string;
          const subscriptionId = invoice.subscription;

          if (subscriptionId) {
            // Get subscription details
            const sub = await stripe.subscriptions.retrieve(subscriptionId as string);

            // Get user from customer ID
            const { data: subData, error: lookupError } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .single();

            if (lookupError) {
              console.error('⚠️ Error finding subscription:', lookupError);
            } else if (subData?.user_id && sub.current_period_start && sub.current_period_end) {
              // Create or update usage tracking for new period with null checks
              const usageData = {
                user_id: subData.user_id,
                period_start: new Date(sub.current_period_start * 1000).toISOString(),
                period_end: new Date(sub.current_period_end * 1000).toISOString(),
                conversation_count: 0,
                widget_count: 0,
              };

              console.log('📊 Resetting usage tracking:', usageData);

              const { error } = await supabase
                .from('usage_tracking')
                .upsert(usageData);

              if (error) {
                console.error('❌ Error resetting usage:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
              } else {
                console.log('✅ Usage tracking reset for user:', subData.user_id);
              }
            }
          }
        } catch (err) {
          console.error('❌ Error in PAYMENT_SUCCEEDED handler:', err);
          console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack');
        }
        break;
      }

      case WEBHOOK_EVENTS.PAYMENT_FAILED: {
        try {
          console.log('❌ Processing invoice.payment_failed');
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          console.log('📋 Failed payment details:', {
            id: invoice.id,
            customer: customerId,
            attempt_count: invoice.attempt_count,
            next_payment_attempt: invoice.next_payment_attempt
          });

          // Update subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('❌ Database error updating subscription status:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // Don't throw, just log the error
          } else {
            console.log('⚠️ Subscription marked as past_due for customer:', customerId);
          }

          // TODO: Send email notification to user
        } catch (err) {
          console.error('❌ Error in PAYMENT_FAILED handler:', err);
          console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return success to Stripe to prevent retries unless there's a critical error
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('🚨 CRITICAL: Webhook handler error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      event_type: event?.type,
      event_id: event?.id
    });

    // Still return 200 to prevent Stripe from retrying
    // The individual handlers log errors but don't throw
    return NextResponse.json({
      received: true,
      warning: 'Handler encountered non-critical errors, check logs'
    });
  }
}