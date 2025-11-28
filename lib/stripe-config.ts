/**
 * Stripe Configuration and Pricing Constants
 */

export const STRIPE_CONFIG = {
  // API version
  apiVersion: '2025-02-24.acacia' as const,

  // Price IDs (replace with your actual Stripe price IDs)
  // These should be created in Stripe Dashboard
  prices: {
    starter: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_1SYIeeL0OvBwJPE63VNTk5VC',
      yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
    },
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1SYIe6L0OvBwJPE6rBPoqm3H',
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
    },
  },
} as const;

// Pricing Plans Configuration
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free Trial',
    description: 'Perfect for trying out SmartChat Pro',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      '14-day free trial',
      'Up to 100 conversations',
      '1 chat widget',
      'Basic AI responses',
      'Email support',
    ],
    limits: {
      conversations: 100,
      widgets: 1,
      knowledgeDocuments: 5,
      teamMembers: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal for small businesses',
    price: {
      monthly: 199,
      yearly: 1990, // ~17% discount
    },
    stripePriceId: {
      monthly: STRIPE_CONFIG.prices.starter.monthly,
      yearly: STRIPE_CONFIG.prices.starter.yearly,
    },
    features: [
      'Everything in Free, plus:',
      'Up to 1,000 conversations/month',
      '1 chat widget',
      'Advanced AI responses',
      'Custom branding',
      'Priority email support',
      'Analytics dashboard',
    ],
    limits: {
      conversations: 1000,
      widgets: 1,
      knowledgeDocuments: 20,
      teamMembers: 2,
    },
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing companies',
    price: {
      monthly: 399,
      yearly: 3990, // ~17% discount
    },
    stripePriceId: {
      monthly: STRIPE_CONFIG.prices.pro.monthly,
      yearly: STRIPE_CONFIG.prices.pro.yearly,
    },
    features: [
      'Everything in Starter, plus:',
      'Up to 5,000 conversations/month',
      '3 chat widgets',
      'Advanced AI with custom training',
      'Remove SmartChat branding',
      'Priority phone & email support',
      'Advanced analytics & reporting',
      'API access',
      'Team collaboration',
    ],
    limits: {
      conversations: 5000,
      widgets: 3,
      knowledgeDocuments: 100,
      teamMembers: 5,
    },
    highlighted: true,
  },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;
export type Plan = typeof PRICING_PLANS[PlanId];

// Subscription Status Mapping
export const SUBSCRIPTION_STATUS = {
  trialing: 'trialing',
  active: 'active',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'incomplete_expired',
  past_due: 'past_due',
  unpaid: 'unpaid',
} as const;

export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

// Helper Functions
export function getPlanById(planId: string): Plan | null {
  return PRICING_PLANS[planId as PlanId] || null;
}

export function getPlanLimits(planId: string) {
  const plan = getPlanById(planId);
  return plan?.limits || PRICING_PLANS.free.limits;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function isSubscriptionActive(status: string): boolean {
  return ['active', 'trialing'].includes(status);
}

export function getSubscriptionEndDate(periodEnd: string | Date): Date {
  return new Date(periodEnd);
}

export function getDaysUntilSubscriptionEnd(periodEnd: string | Date): number {
  const endDate = getSubscriptionEndDate(periodEnd);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getUsagePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function isUsageLimitReached(used: number, limit: number): boolean {
  return used >= limit;
}

// Stripe Webhook Event Types
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

// Error Messages
export const BILLING_ERRORS = {
  NO_SUBSCRIPTION: 'No active subscription found',
  PAYMENT_FAILED: 'Payment failed. Please update your payment method.',
  SUBSCRIPTION_CANCELED: 'Your subscription has been canceled',
  LIMIT_REACHED: 'You have reached your plan limit',
  INVALID_PLAN: 'Invalid pricing plan selected',
  CHECKOUT_FAILED: 'Failed to create checkout session',
  PORTAL_FAILED: 'Failed to create customer portal session',
} as const;