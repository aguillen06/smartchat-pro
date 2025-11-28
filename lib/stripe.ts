/**
 * Stripe Client Configuration
 */

import Stripe from 'stripe';
import { STRIPE_CONFIG } from './stripe-config';

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_CONFIG.apiVersion,
  typescript: true,
});

// Client-side Stripe configuration
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
};