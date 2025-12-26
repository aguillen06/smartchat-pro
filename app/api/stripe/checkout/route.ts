import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { isValidPriceId } from '@/lib/stripe/plans'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://smartchat.symtri.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, email, userId, successUrl, cancelUrl } = body

    // Validate price ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    if (!isValidPriceId(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${APP_URL}/checkout/cancel`,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        userId: userId || '',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
