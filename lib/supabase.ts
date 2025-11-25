import { createClient } from '@supabase/supabase-js';

/**
 * Supabase URL from environment variables
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Supabase anonymous key for client-side operations
 */
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase service role key for server-side admin operations
 */
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/**
 * Supabase client for browser/client-side operations
 * Uses the anonymous key with row-level security
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase admin client for server-side operations
 * Uses the service role key to bypass row-level security
 * WARNING: Only use this in API routes or server components
 */
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not found. Admin client will not be available.'
    );
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

/**
 * Type-safe helper to ensure admin client is available
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase admin client is not available. Please set SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return supabaseAdmin;
}

// =====================================================
// DATABASE HELPER FUNCTIONS
// =====================================================

/**
 * Get customer by email address
 * @param email - Customer email address
 * @returns Customer object or null if not found
 */
export async function getCustomerByEmail(email: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching customer by email:', error);
    return null;
  }

  return data;
}

/**
 * Get widget by widget key
 * @param widgetKey - Unique widget key used in embed script
 * @returns Widget object with customer data or null if not found
 */
export async function getWidgetByKey(widgetKey: string) {
  const { data, error } = await supabase
    .from('widgets')
    .select(`
      *,
      customer:customers (*)
    `)
    .eq('widget_key', widgetKey)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching widget by key:', error);
    return null;
  }

  return data;
}

/**
 * Create a new conversation
 * @param widgetId - UUID of the widget
 * @param visitorId - Anonymous visitor identifier
 * @returns Newly created conversation object
 */
export async function createConversation(
  widgetId: string,
  visitorId: string
) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      widget_id: widgetId,
      visitor_id: visitorId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data;
}

/**
 * Get conversation with messages
 * @param conversationId - UUID of the conversation
 * @returns Conversation object with messages array
 */
export async function getConversationWithMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation with messages:', error);
    return null;
  }

  return data;
}

/**
 * Add a message to a conversation
 * @param conversationId - UUID of the conversation
 * @param role - Message role (user or assistant)
 * @param content - Message content
 * @returns Newly created message object
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw new Error(`Failed to add message: ${error.message}`);
  }

  // Update last_message_at timestamp
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

/**
 * Get knowledge docs for a widget
 * @param widgetId - UUID of the widget
 * @returns Array of knowledge documents
 */
export async function getKnowledgeDocs(widgetId: string) {
  const { data, error } = await supabase
    .from('knowledge_docs')
    .select('*')
    .eq('widget_id', widgetId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge docs:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a lead from a conversation
 * @param conversationId - UUID of the conversation
 * @param widgetId - UUID of the widget
 * @param leadData - Lead information (name, email, phone, message)
 * @returns Newly created lead object
 */
export async function createLead(
  conversationId: string,
  widgetId: string,
  leadData: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }
) {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      conversation_id: conversationId,
      widget_id: widgetId,
      ...leadData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  // Mark conversation as having lead captured
  await supabase
    .from('conversations')
    .update({ lead_captured: true })
    .eq('id', conversationId);

  return data;
}
