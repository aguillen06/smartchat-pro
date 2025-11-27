import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
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
  console.log('🚀 [Chat API] Request received');

  try {
    // Parse request body
    const body: ChatRequest = await request.json();
    console.log('📦 [Chat API] Request body:', {
      widgetKey: body.widgetKey,
      messageLength: body.message?.length,
      hasVisitorId: !!body.visitorId,
      hasConversationId: !!body.conversationId
    });

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
    console.log('🔍 [Chat API] Looking up widget:', widgetKey);
    console.log('🔧 [Chat API] Supabase config check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseClient: !!supabase
    });

    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, widget_key, ai_instructions, is_active, customer_id')
      .eq('widget_key', widgetKey)
      .single();

    if (widgetError || !widget) {
      console.error('❌ [Chat API] Widget lookup error:', widgetError);
      return NextResponse.json<ApiError>(
        { error: 'Widget not found', code: 'WIDGET_NOT_FOUND' },
        { status: 404 }
      );
    }

    console.log('✅ [Chat API] Widget found:', { id: widget.id, isActive: widget.is_active });

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
      console.log('🆕 [Chat API] Creating new conversation');
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
        console.error('❌ [Chat API] Error creating conversation:', createError);
        return NextResponse.json<ApiError>(
          { error: 'Failed to create conversation', code: 'CONVERSATION_CREATE_ERROR' },
          { status: 500 }
        );
      }

      currentConversationId = newConv.id;
      console.log('✅ [Chat API] Conversation created:', currentConversationId);
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

    // 5a. Check if we should prompt for lead capture
    const messageCount = conversationHistory.length;
    const { data: conversation } = await supabase
      .from('conversations')
      .select('lead_captured')
      .eq('id', currentConversationId)
      .single();

    const shouldPromptForLead = messageCount >= 6 && !conversation?.lead_captured;

    // 6. Search knowledge base for relevant context
    const knowledgeResults = await searchKnowledge(widget.id, message, 3);
    const knowledgeContext = formatKnowledgeContext(knowledgeResults);

    // 7. Build system prompt with widget instructions and knowledge
    let systemPrompt = widget.ai_instructions ||
      `You are a helpful AI assistant for Symtri AI, an AI automation company helping small businesses.

⚠️ LENGTH RULES:
- Maximum 2-3 sentences per response
- Keep it under 50 words
- Sound conversational and natural

🎯 WHEN TO ASK FOR EMAIL (be selective):
ASK for email when discussing:
- Products, services, or solutions
- Demos or trials
- Pricing or quotes
- Contact or scheduling
- Case studies or examples

DO NOT ask for email when:
- Answering casual questions (weather, jokes, general chat)
- Providing simple factual info (hours, location)
- User is just browsing or exploring

📝 RESPONSE STYLE:
- Be helpful and friendly FIRST
- Provide useful info
- THEN offer to send more details via email (if relevant)
- Don't force email capture on every message

✅ GOOD EXAMPLES:

Q: What does Symtri AI do?
A: We're an AI automation company helping small businesses with chatbots, voice systems, lead management, and document processing. Want to see how we can help your business? I can email you some examples!

Q: What's the weather?
A: I focus on AI automation solutions, not weather! But I'm here if you have questions about our products.

Q: How much does SmartChat Pro cost?
A: Pricing starts at $99/month for basics. I can send you a detailed breakdown - what's your email?

Q: Do you have demos?
A: Yes! I can send you demo links right now. What's your email address?

Q: Tell me a joke
A: Why did the AI go to therapy? It had too many layers! 😄 Anything I can help you with about Symtri AI?

Remember: Be helpful first, capture email when it makes sense.`;

    if (knowledgeContext) {
      systemPrompt += '\n\n' + knowledgeContext + '\n\nUse this to answer naturally. Ask for email only if discussing products/services.';
    }

    // Add lead capture prompt if appropriate
    if (shouldPromptForLead) {
      systemPrompt += `\n\nNOTE: The user has been chatting for a bit. If they seem interested in our services, naturally offer to send more details: "Want me to send you more info about [topic]? What's your email?"`;
    }

    // 8. Generate AI response using Anthropic
    console.log('🤖 [Chat API] Generating AI response');
    console.log('🔧 [Chat API] Anthropic config check:', {
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      apiKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) + '...',
      conversationHistoryLength: conversationHistory.length,
      systemPromptLength: systemPrompt.length
    });

    let aiResponse: string;
    try {
      aiResponse = await generateChatResponseWithHistory(
        conversationHistory,
        systemPrompt
      );
      console.log('✅ [Chat API] AI response generated, length:', aiResponse.length);
    } catch (anthropicError) {
      console.error('❌ [Chat API] Anthropic API error details:', {
        error: anthropicError,
        message: anthropicError instanceof Error ? anthropicError.message : 'Unknown error',
        stack: anthropicError instanceof Error ? anthropicError.stack : undefined
      });
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

    // 10a. Detect and capture lead information from user message
    console.log('\n🔍 [Lead Capture] ========== STARTING LEAD DETECTION ==========');
    console.log('🔍 [Lead Capture] Conversation ID:', currentConversationId);
    console.log('🔍 [Lead Capture] Conversation lead_captured flag:', conversation?.lead_captured);
    console.log('🔍 [Lead Capture] User message:', message);

    // Email regex - matches emails with 2+ character TLDs (including .co, .io, etc.)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    // Phone regex (various formats)
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;

    // Test regex matches first (before checking lead_captured flag)
    const emailMatch = message.match(emailRegex);
    const phoneMatch = message.match(phoneRegex);

    console.log('🔍 [Lead Capture] Regex test results:');
    console.log('   - Email match:', emailMatch ? emailMatch[0] : 'NONE');
    console.log('   - Phone match:', phoneMatch ? phoneMatch[0] : 'NONE');

    if (!conversation?.lead_captured) {
      console.log('✅ [Lead Capture] Conversation does NOT have lead yet - proceeding...');

      console.log('🔍 [Lead Capture] Final check - Email or Phone detected?', !!(emailMatch || phoneMatch));

      if (emailMatch || phoneMatch) {
        console.log('📧 [Lead Capture] Contact info detected! Saving to database...');
        console.log('📧 [Lead Capture] Widget ID:', widget.id);
        console.log('📧 [Lead Capture] Conversation ID:', currentConversationId);

        try {
          const leadData = {
            conversation_id: currentConversationId,
            widget_id: widget.id,
            name: null,  // Will be extracted later
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0] : null,
            message: null,  // Optional
            // source: 'chat_prompt',  // TODO: Add after migration
          };

          console.log('📧 [Lead Capture] Attempting to insert:', leadData);

          // Use admin client to bypass RLS for lead capture
          const supabaseAdmin = getSupabaseAdmin();

          // Check if this email exists in previous leads
          const { data: existingLeads, error: checkError } = await supabaseAdmin
            .from('leads')
            .select('id, email, created_at')
            .eq('widget_id', widget.id)
            .eq('email', emailMatch ? emailMatch[0] : null)
            .limit(5);

          if (existingLeads && existingLeads.length > 0) {
            console.log('🔄 [Lead Capture] REPEAT CONTACT detected!');
            console.log('🔄 [Lead Capture] This email has contacted us', existingLeads.length, 'time(s) before');
            console.log('🔄 [Lead Capture] Previous contacts:', existingLeads.map(l => l.created_at));
            console.log('🔥 [Lead Capture] This is a HOT LEAD - they keep coming back!');
          }

          const { data: insertedLead, error: leadError } = await supabaseAdmin
            .from('leads')
            .insert(leadData)
            .select();

          if (leadError) {
            console.error('❌ [Lead Capture] Error saving lead:', leadError);
            console.error('❌ [Lead Capture] Error details:', JSON.stringify(leadError, null, 2));
          } else {
            console.log('✅ [Lead Capture] Lead saved successfully!');
            console.log('✅ [Lead Capture] Inserted lead data:', insertedLead);
            if (existingLeads && existingLeads.length > 0) {
              console.log('📊 [Lead Capture] Total contacts from this email:', existingLeads.length + 1);
            }

            // Update conversation to mark lead as captured
            console.log('📝 [Lead Capture] Updating conversation lead_captured flag...');
            const { data: updatedConv, error: updateError } = await supabaseAdmin
              .from('conversations')
              .update({ lead_captured: true })
              .eq('id', currentConversationId)
              .select();

            if (updateError) {
              console.error('❌ [Lead Capture] Error updating conversation:', updateError);
            } else {
              console.log('✅ [Lead Capture] Conversation updated:', updatedConv);
            }
          }
        } catch (leadCaptureError) {
          console.error('❌ [Lead Capture] Exception in lead capture process:', leadCaptureError);
          console.error('❌ [Lead Capture] Stack trace:', leadCaptureError instanceof Error ? leadCaptureError.stack : 'No stack trace');
          // Don't fail the request
        }
      } else {
        console.log('⏭️ [Lead Capture] No email or phone detected in message');
      }
    } else {
      console.log('⛔ [Lead Capture] SKIPPING - Lead already captured for this conversation');
      console.log('⛔ [Lead Capture] Conversation ID:', currentConversationId);
      console.log('⛔ [Lead Capture] lead_captured flag:', conversation?.lead_captured);
      console.log('💡 [Lead Capture] TIP: Start a NEW conversation to test lead capture again');
    }

    console.log('🔍 [Lead Capture] ========== END LEAD DETECTION ==========\n');

    // 11. Return response
    const response: ChatResponse = {
      conversationId: currentConversationId,
      message: aiResponse,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ [Chat API] Request completed successfully');
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ [Chat API] Unexpected error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
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
