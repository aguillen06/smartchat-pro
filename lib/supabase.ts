/**
 * Main Supabase exports
 *
 * IMPORTANT: This file should ONLY be imported in server components and API routes!
 * For client components and auth pages, use './supabase-browser' instead.
 */

import 'server-only';

// Re-export server-side clients and all database helper functions
export {
  supabase,
  supabaseAdmin,
  getSupabaseAdmin,
  getCustomerByEmail,
  getWidgetByKey,
  createConversation,
  getConversationWithMessages,
  addMessage,
  getKnowledgeDocs,
  createLead,
} from './supabase-server';
