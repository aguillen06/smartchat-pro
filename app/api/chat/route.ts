import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateChatResponseWithHistory } from '@/lib/anthropic';
import { searchKnowledge, formatKnowledgeContext } from '@/lib/knowledge-search';
import type {
  ChatRequest,
  ChatResponse,
  ApiError,
  ConversationMessage,
} from '@/types/api';

/**
 * Rate limiting configuration
 * In production, use Redis or a dedicated rate limiting service
 */
const RATE_LIMIT = {
  MAX_MESSAGES_PER_CONVERSATION: 100,
  TIME_WINDOW_HOURS: 1,
};

/**
 * POST /api/chat
 * Handle incoming chat messages and generate AI responses
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();

    // Validate required fields
    const { widgetKey, message, visitorId, conversationId } = body;

    if (!widgetKey || typeof widgetKey !== 'string') {
      return NextResponse.json<ApiError>(
        { error: 'widgetKey is required and must be a string' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json<ApiError>(
        { error: 'visitorId is required and must be a string' },
        { status: 400 }
      );
    }

    // 1. Validate widget exists and is active
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, widget_key, ai_instructions, is_active, customer_id')
      .eq('widget_key', widgetKey)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json<ApiError>(
        { error: 'Widget not found', code: 'WIDGET_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!widget.is_active) {
      return NextResponse.json<ApiError>(
        { error: 'Widget is not active', code: 'WIDGET_INACTIVE' },
        { status: 403 }
      );
    }

    // 2. Get or create conversation
    let currentConversationId = conversationId;

    if (conversationId) {
      // Verify conversation exists and belongs to this widget
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('id, widget_id')
        .eq('id', conversationId)
        .eq('widget_id', widget.id)
        .single();

      if (convError || !existingConv) {
        return NextResponse.json<ApiError>(
          { error: 'Conversation not found', code: 'CONVERSATION_NOT_FOUND' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          widget_id: widget.id,
          visitor_id: visitorId,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError || !newConv) {
        console.error('Error creating conversation:', createError);
        return NextResponse.json<ApiError>(
          { error: 'Failed to create conversation', code: 'CONVERSATION_CREATE_ERROR' },
          { status: 500 }
        );
      }

      currentConversationId = newConv.id;
    }

    // 3. Check rate limiting (simple version)
    if (conversationId) {
      const oneHourAgo = new Date(Date.now() - RATE_LIMIT.TIME_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

      const { count, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .gte('created_at', oneHourAgo);

      if (countError) {
        console.error('Error checking rate limit:', countError);
      } else if (count && count >= RATE_LIMIT.MAX_MESSAGES_PER_CONVERSATION) {
        return NextResponse.json<ApiError>(
          {
            error: 'Rate limit exceeded. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          { status: 429 }
        );
      }
    }

    // 4. Save user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message.trim(),
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return NextResponse.json<ApiError>(
        { error: 'Failed to save message', code: 'MESSAGE_SAVE_ERROR' },
        { status: 500 }
      );
    }

    // 5. Get conversation history (last 10 messages for context)
    const { data: historyMessages, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Reverse to chronological order (oldest first)
    const conversationHistory: ConversationMessage[] = (historyMessages || []).reverse();

    // 6. Search knowledge base for relevant context
    const knowledgeResults = await searchKnowledge(widget.id, message, 3);
    const knowledgeContext = formatKnowledgeContext(knowledgeResults);

    // 7. Build system prompt with widget instructions and knowledge
    let systemPrompt = widget.ai_instructions ||
      'You are a helpful customer service assistant. Be friendly, professional, and concise.';

    if (knowledgeContext) {
      systemPrompt += '\n\n' + knowledgeContext + '\n\nUse this information to help answer questions accurately.';
    }

    // 8. Generate AI response using Anthropic
    let aiResponse: string;
    try {
      aiResponse = await generateChatResponseWithHistory(
        conversationHistory,
        systemPrompt
      );
    } catch (anthropicError) {
      console.error('Anthropic API error:', anthropicError);
      return NextResponse.json<ApiError>(
        {
          error: 'Failed to generate AI response',
          code: 'AI_GENERATION_ERROR',
          details: { message: anthropicError instanceof Error ? anthropicError.message : 'Unknown error' }
        },
        { status: 500 }
      );
    }

    // 9. Save AI response
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiResponse,
      });

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
      // Don't fail the request, user already got the response
    }

    // 10. Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', currentConversationId);

    // 11. Return response
    const response: ChatResponse = {
      conversationId: currentConversationId,
      message: aiResponse,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    return NextResponse.json<ApiError>(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/chat
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
