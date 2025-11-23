/**
 * Core type definitions for SmartChat Pro
 */

/**
 * Customer represents a business/organization using the chatbot service
 */
export interface Customer {
  id: string;
  business_name: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due' | null;
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise' | null;
  created_at: string;
  updated_at: string;
}

/**
 * Widget is a chatbot instance that can be embedded on a customer's website
 */
export interface Widget {
  id: string;
  customer_id: string;
  widget_key: string; // Unique key for embedding the widget
  name: string; // Internal name for the widget
  welcome_message: string;
  ai_instructions: string; // Custom instructions for how the AI should behave
  primary_color: string; // Hex color for widget branding
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  is_active: boolean;
  allowed_domains: string[]; // Domains where the widget can be embedded
  created_at: string;
  updated_at: string;
}

/**
 * Conversation represents a chat session between a visitor and the AI
 */
export interface Conversation {
  id: string;
  widget_id: string;
  visitor_id: string; // Anonymous identifier for the visitor
  started_at: string;
  ended_at: string | null;
  lead_captured: boolean; // Whether visitor contact info was collected
  visitor_metadata: {
    user_agent?: string;
    referrer?: string;
    ip_address?: string;
    country?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Message represents a single message in a conversation
 */
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

/**
 * KnowledgeDoc represents a document in the knowledge base for a widget
 */
export interface KnowledgeDoc {
  id: string;
  widget_id: string;
  title: string;
  content: string;
  source_url: string | null;
  doc_type: 'faq' | 'documentation' | 'policy' | 'article' | 'other';
  embedding: number[] | null; // Vector embedding for semantic search
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Lead represents contact information captured from a conversation
 */
export interface Lead {
  id: string;
  conversation_id: string;
  widget_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null; // Optional message from the lead
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
}

/**
 * Analytics data for tracking widget performance
 */
export interface WidgetAnalytics {
  widget_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  total_conversations: number;
  total_messages: number;
  leads_captured: number;
  avg_conversation_length: number; // Average number of messages
  unique_visitors: number;
}

/**
 * Webhook configuration for sending conversation events
 */
export interface Webhook {
  id: string;
  customer_id: string;
  url: string;
  events: ('conversation.started' | 'conversation.ended' | 'lead.captured')[];
  is_active: boolean;
  secret: string; // For verifying webhook signatures
  created_at: string;
  updated_at: string;
}

/**
 * API key for programmatic access
 */
export interface ApiKey {
  id: string;
  customer_id: string;
  name: string; // Friendly name for the key
  key_hash: string; // Hashed version of the actual key
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

/**
 * Subscription plan configuration
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  price_monthly: number; // In cents
  price_yearly: number | null; // In cents
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  features: {
    max_widgets: number;
    max_conversations_per_month: number;
    max_knowledge_docs: number;
    custom_branding: boolean;
    api_access: boolean;
    webhooks: boolean;
    analytics_retention_days: number;
    priority_support: boolean;
  };
  is_active: boolean;
}

/**
 * Database insert types (omit auto-generated fields)
 */
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type WidgetInsert = Omit<Widget, 'id' | 'created_at' | 'updated_at'>;
export type ConversationInsert = Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
export type MessageInsert = Omit<Message, 'id' | 'created_at'>;
export type KnowledgeDocInsert = Omit<KnowledgeDoc, 'id' | 'created_at' | 'updated_at'>;
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
