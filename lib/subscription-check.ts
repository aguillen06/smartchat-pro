/**
 * Subscription Check Utilities
 *
 * Functions to check subscription status and enforce limits
 */

import { getSupabaseAdmin } from './supabase';
import { getPlanLimits, isSubscriptionActive } from './stripe-config';

export interface SubscriptionCheck {
  hasAccess: boolean;
  reason?: string;
  subscription?: any;
  usage?: any;
}

/**
 * Check if user can create a new conversation based on their subscription
 */
export async function canCreateConversation(userId: string): Promise<SubscriptionCheck> {
  try {
    const supabase = getSupabaseAdmin();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No subscription found. Please subscribe to continue.',
      };
    }

    // Check if subscription is active
    if (!isSubscriptionActive(subscription.status)) {
      return {
        hasAccess: false,
        reason: 'Your subscription is not active. Please update your billing information.',
        subscription,
      };
    }

    // Get plan limits
    const limits = getPlanLimits(subscription.plan);

    // Get current usage
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('conversation_count')
      .eq('user_id', userId)
      .eq('period_start', subscription.current_period_start)
      .single();

    const currentCount = usage?.conversation_count || 0;

    // Check if within limits
    if (currentCount >= limits.conversations) {
      return {
        hasAccess: false,
        reason: `You've reached your limit of ${limits.conversations} conversations for this billing period. Please upgrade your plan to continue.`,
        subscription,
        usage,
      };
    }

    return {
      hasAccess: true,
      subscription,
      usage,
    };
  } catch (error) {
    console.error('Error checking conversation limit:', error);
    return {
      hasAccess: false,
      reason: 'Error checking subscription status.',
    };
  }
}

/**
 * Check if user can create a new widget based on their subscription
 */
export async function canCreateWidget(userId: string): Promise<SubscriptionCheck> {
  try {
    const supabase = getSupabaseAdmin();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No subscription found. Please subscribe to continue.',
      };
    }

    // Check if subscription is active
    if (!isSubscriptionActive(subscription.status)) {
      return {
        hasAccess: false,
        reason: 'Your subscription is not active. Please update your billing information.',
        subscription,
      };
    }

    // Get plan limits
    const limits = getPlanLimits(subscription.plan);

    // Get current widget count
    const { count: widgetCount } = await supabase
      .from('widgets')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('is_active', true);

    const currentCount = widgetCount || 0;

    // Check if within limits
    if (currentCount >= limits.widgets) {
      return {
        hasAccess: false,
        reason: `You've reached your limit of ${limits.widgets} widgets for your plan. Please upgrade to create more widgets.`,
        subscription,
      };
    }

    return {
      hasAccess: true,
      subscription,
    };
  } catch (error) {
    console.error('Error checking widget limit:', error);
    return {
      hasAccess: false,
      reason: 'Error checking subscription status.',
    };
  }
}

/**
 * Check if user can upload knowledge documents based on their subscription
 */
export async function canUploadDocument(userId: string): Promise<SubscriptionCheck> {
  try {
    const supabase = getSupabaseAdmin();

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No subscription found. Please subscribe to continue.',
      };
    }

    // Check if subscription is active
    if (!isSubscriptionActive(subscription.status)) {
      return {
        hasAccess: false,
        reason: 'Your subscription is not active. Please update your billing information.',
        subscription,
      };
    }

    // Get plan limits
    const limits = getPlanLimits(subscription.plan);

    // Get current document count
    const { count: docCount } = await supabase
      .from('knowledge_docs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const currentCount = docCount || 0;

    // Check if within limits
    if (currentCount >= limits.knowledgeDocuments) {
      return {
        hasAccess: false,
        reason: `You've reached your limit of ${limits.knowledgeDocuments} knowledge documents for your plan. Please upgrade or remove existing documents.`,
        subscription,
      };
    }

    return {
      hasAccess: true,
      subscription,
    };
  } catch (error) {
    console.error('Error checking document limit:', error);
    return {
      hasAccess: false,
      reason: 'Error checking subscription status.',
    };
  }
}

/**
 * Increment conversation count for usage tracking
 */
export async function incrementConversationCount(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    // Get subscription to find billing period
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('current_period_start, current_period_end')
      .eq('user_id', userId)
      .single();

    if (!subscription) return;

    // Increment usage count
    const { error } = await supabase.rpc('increment_conversation_count', {
      user_uuid: userId,
    });

    if (error) {
      console.error('Error incrementing conversation count:', error);
    }
  } catch (error) {
    console.error('Error in incrementConversationCount:', error);
  }
}

/**
 * Check if trial has expired
 */
export async function isTrialExpired(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', userId)
      .single();

    if (!subscription) return false;

    if (subscription.status === 'trialing' && subscription.trial_ends_at) {
      const trialEndDate = new Date(subscription.trial_ends_at);
      return trialEndDate < new Date();
    }

    return false;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
}

/**
 * Get subscription details with usage for a user
 */
export async function getSubscriptionWithUsage(userId: string) {
  try {
    const supabase = getSupabaseAdmin();

    // Use the view we created
    const { data, error } = await supabase
      .from('subscription_with_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription with usage:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSubscriptionWithUsage:', error);
    return null;
  }
}