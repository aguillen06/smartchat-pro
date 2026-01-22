import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://smartchat.symtri.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, email, tenantId, userId, successUrl, cancelUrl } = body

    // Validate price ID exists
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: successUrl || `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${APP_URL}/checkout/cancel`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        tenant_id: tenantId || '',
        userId: userId || '',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout session error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    )
  }
}
