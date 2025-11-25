/**
 * API Type Definitions for SmartChat Pro
 */

// =====================================================
// CHAT API TYPES
// =====================================================

/**
 * Request body for POST /api/chat
 */
export interface ChatRequest {
  widgetKey: string;
  message: string;
  conversationId?: string;
  visitorId: string;
}

/**
 * Response from POST /api/chat
 */
export interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: string;
}

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// =====================================================
// KNOWLEDGE SEARCH TYPES
// =====================================================

/**
 * Knowledge document search result
 */
export interface KnowledgeSearchResult {
  id: string;
  content: string;
  source_url: string | null;
  doc_type: string;
  relevance_score?: number;
}

// =====================================================
// CONVERSATION TYPES
// =====================================================

/**
 * Conversation message for context
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// =====================================================
// WIDGET CONFIGURATION TYPES
// =====================================================

/**
 * Widget configuration from database
 */
export interface WidgetConfig {
  id: string;
  widget_key: string;
  welcome_message: string;
  ai_instructions: string | null;
  primary_color: string;
  is_active: boolean;
  customer_id: string;
}

// =====================================================
// RATE LIMITING TYPES
// =====================================================

/**
 * Rate limit information
 */
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit exceeded error
 */
export interface RateLimitError extends ApiError {
  code: 'RATE_LIMIT_EXCEEDED';
  rateLimit: RateLimit;
}
