// SmartChat pricing plans configuration
// Price IDs from Stripe Dashboard

export interface PlanConfig {
  name: string
  priceId: string
  price: number
  features: string[]
  conversations: string
  websites: string
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_1SbvEALNymQzQ2Suj9BpACKp',
    price: 297,
    features: ['1,000 conversations/mo', '1 website', 'Dashboard access', 'Email support'],
    conversations: '1,000',
    websites: '1',
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_1SbvETLNymQzQ2SupQdP8n4g',
    price: 397,
    features: ['5,000 conversations/mo', '3 websites', 'Priority support', 'Chat analytics'],
    conversations: '5,000',
    websites: '3',
  },
}

// Map price ID to plan name
export const PRICE_TO_PLAN: Record<string, string> = {
  [PLANS.starter.priceId]: 'starter',
  [PLANS.professional.priceId]: 'professional',
}

// Get plan by price ID
export function getPlanByPriceId(priceId: string): PlanConfig | null {
  const planName = PRICE_TO_PLAN[priceId]
  return planName ? PLANS[planName] : null
}

// Validate price ID
export function isValidPriceId(priceId: string): boolean {
  return Object.values(PLANS).some(plan => plan.priceId === priceId)
}

// Get all valid price IDs
export function getValidPriceIds(): string[] {
  return Object.values(PLANS).map(plan => plan.priceId)
}
