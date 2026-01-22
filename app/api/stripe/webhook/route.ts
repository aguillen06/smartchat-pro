import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { PRICE_TO_PLAN, PLANS } from '@/lib/stripe/plans'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendWelcomeEmail } from '@/lib/email/send'

// Use service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Check idempotency - prevent duplicate processing
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ received: true, message: 'Already processed' })
  }

  // Record the event
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const customerEmail = session.customer_email || session.customer_details?.email
  const tenantId = session.metadata?.tenant_id
  const userId = session.metadata?.userId

  if (!customerEmail) {
    console.error('No customer email in checkout session')
    return
  }

  // If we have a tenant_id from the new signup flow
  if (tenantId) {
    // Update tenant with Stripe customer ID and activate
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({
        stripe_customer_id: customerId,
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        products: { smartchat: true, phonebot: false },
      })
      .eq('id', tenantId)

    if (tenantError) {
      console.error('Failed to update tenant:', tenantError)
    }

    // Update user with Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('tenant_id', tenantId)

    // Get user for subscription record
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .single()

    // Fetch full subscription details from Stripe
    const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
    const subscriptionItem = subscriptionData.items.data[0]
    const priceId = subscriptionItem.price.id
    const plan = PRICE_TO_PLAN[priceId] || 'starter'

    // Create subscription record linked to tenant
    await supabase.from('subscriptions').insert({
      user_id: user?.id,
      tenant_id: tenantId,
      product: 'smartchat',
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      plan,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
    })

    console.log(`Created subscription for tenant ${tenantId}, plan: ${plan}`)

    // Send welcome email
    await sendWelcomeEmail({
      email: customerEmail,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartchat.symtri.ai'}/onboarding/business`,
    })

    return
  }

  // Legacy flow: Check if user exists by email
  let { data: user } = await supabase
    .from('users')
    .select('id, tenant_id')
    .eq('email', customerEmail)
    .single()

  // If no user exists, create one (legacy support)
  if (!user) {
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId || crypto.randomUUID(),
        email: customerEmail,
        stripe_customer_id: customerId,
      })
      .select('id, tenant_id')
      .single()

    if (userError) {
      console.error('Failed to create user:', userError)
      return
    }
    user = newUser
  } else {
    // Update existing user with Stripe customer ID
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Fetch full subscription details from Stripe
  const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
  const subscriptionItem = subscriptionData.items.data[0]
  const priceId = subscriptionItem.price.id
  const plan = PRICE_TO_PLAN[priceId] || 'starter'

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: user.id,
    tenant_id: user.tenant_id || null,
    product: 'smartchat',
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    plan,
    status: subscriptionData.status,
    current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscriptionData.cancel_at_period_end,
  })

  console.log(`Created subscription for user ${user.id}, plan: ${plan}`)

  // Send welcome email
  await sendWelcomeEmail({
    email: customerEmail,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartchat.symtri.ai'}/dashboard`,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionItem = subscription.items.data[0]
  const priceId = subscriptionItem.price.id
  const plan = PRICE_TO_PLAN[priceId] || 'starter'

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId,
      plan,
      current_period_start: new Date(subscriptionItem.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionItem.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to update subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Failed to delete subscription:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID - use type assertion for compatibility with different SDK versions
  const invoiceData = invoice as unknown as { subscription?: string | { id: string } }
  const subscriptionId = invoiceData.subscription

  if (!subscriptionId) return

  // Extract the ID string if it's a Subscription object
  const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subId)

  if (error) {
    console.error('Failed to update subscription status:', error)
  }
}
