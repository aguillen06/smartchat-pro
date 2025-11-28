'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  PRICING_PLANS,
  formatPrice,
  getUsagePercentage,
  isSubscriptionActive,
  getDaysUntilSubscriptionEnd
} from '@/lib/stripe-config';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  current_conversation_count: number;
  conversation_limit: number;
  current_widget_count: number;
  widget_limit: number;
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');

  // Check for success/cancel params
  const isSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  const isCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  useEffect(() => {
    // Handle successful checkout with session verification
    async function verifyCheckoutSession() {
      if (isSuccess && sessionId) {
        console.log('Success detected with session_id:', sessionId);

        try {
          // Verify the session with Stripe
          const response = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Session verified successfully:', data);
            alert(`Subscription activated successfully! You are now on the ${data.plan} plan.`);

            // Clear URL params
            router.replace('/dashboard/billing');

            // Reload subscription data to show new plan
            await loadSubscription();
          } else {
            const error = await response.json();
            console.error('Failed to verify session:', error);
            alert('Failed to verify subscription. Please contact support if the issue persists.');
            router.replace('/dashboard/billing');
          }
        } catch (error) {
          console.error('Error verifying session:', error);
          alert('Error activating subscription. Please refresh the page.');
          router.replace('/dashboard/billing');
        }
      } else if (isSuccess && !sessionId) {
        // Old flow without session_id (shouldn't happen with new checkout)
        console.log('Success param detected without session_id');
        alert('Payment successful! Your subscription should be active shortly.');
        router.replace('/dashboard/billing');
        loadSubscription();
      } else if (isCanceled) {
        console.log('Canceled param detected');
        alert('Subscription canceled.');
        router.replace('/dashboard/billing');
      }
    }

    if (user) {
      verifyCheckoutSession();
    }
  }, [isSuccess, sessionId, isCanceled, user]);

  async function loadSubscription() {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    if (changingPlan) return;

    console.log('Starting checkout for plan:', planId, 'billing:', selectedBilling);
    setChangingPlan(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod: selectedBilling,
        }),
      });

      console.log('Checkout API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout API error:', errorText);
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout API response:', data);

      if (data.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Failed to start checkout: ${error.message}`);
    } finally {
      setChangingPlan(false);
    }
  }

  async function handleManageSubscription() {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading billing information...</div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription ? isSubscriptionActive(subscription.status) : false;
  const daysRemaining = subscription?.current_period_end
    ? getDaysUntilSubscriptionEnd(subscription.current_period_end)
    : 14;

  // Usage percentages
  const conversationUsage = subscription
    ? getUsagePercentage(subscription.current_conversation_count, subscription.conversation_limit)
    : 0;
  const widgetUsage = subscription
    ? getUsagePercentage(subscription.current_widget_count, subscription.widget_limit)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
        <p className="text-gray-600 mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900 capitalize">
                {currentPlan === 'free' ? 'Free Trial' : `${currentPlan} Plan`}
              </span>
              {isActive && (
                <span className="px-2.5 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Active
                </span>
              )}
              {!isActive && subscription?.status === 'past_due' && (
                <span className="px-2.5 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  Past Due
                </span>
              )}
              {!isActive && subscription?.status === 'canceled' && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  Canceled
                </span>
              )}
            </div>
            {subscription?.current_period_end && (
              <p className="text-sm text-gray-600 mt-2">
                {currentPlan === 'free'
                  ? `Trial ends in ${daysRemaining} days`
                  : `Renews in ${daysRemaining} days`}
              </p>
            )}
          </div>
          {currentPlan !== 'free' && (
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-900 mb-4">Conversations</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used this month</span>
              <span className="font-medium text-gray-900">
                {subscription?.current_conversation_count || 0} / {subscription?.conversation_limit || 100}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  conversationUsage >= 90 ? 'bg-red-500' : conversationUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${conversationUsage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {100 - conversationUsage}% remaining
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-900 mb-4">Active Widgets</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Currently active</span>
              <span className="font-medium text-gray-900">
                {subscription?.current_widget_count || 0} / {subscription?.widget_limit || 1}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  widgetUsage >= 100 ? 'bg-red-500' : widgetUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${widgetUsage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {subscription?.widget_limit - (subscription?.current_widget_count || 0)} available
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h3>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedBilling === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedBilling === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Yearly <span className="text-green-600 text-sm ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(PRICING_PLANS).map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const price = selectedBilling === 'yearly'
              ? plan.price.yearly / 12  // Show monthly price for yearly
              : plan.price.monthly;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  plan.highlighted ? 'ring-2 ring-blue-500' : ''
                } ${isCurrentPlan ? 'bg-blue-50' : ''}`}
              >
                {plan.highlighted && (
                  <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full inline-block mb-4">
                    RECOMMENDED
                  </div>
                )}

                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(price)}
                  </span>
                  <span className="text-gray-600">/month</span>
                  {selectedBilling === 'yearly' && (
                    <div className="text-sm text-gray-500 mt-1">
                      Billed {formatPrice(plan.price.yearly)} yearly
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    Free Trial
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={changingPlan}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      plan.highlighted
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {changingPlan ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        {currentPlan === 'free' ? (
          <p className="text-gray-500 text-sm">
            No billing history yet. Upgrade to a paid plan to see your invoices here.
          </p>
        ) : (
          <div className="text-sm text-gray-600">
            <p>View and download your invoices in the</p>
            <button
              onClick={handleManageSubscription}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Customer Portal →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}