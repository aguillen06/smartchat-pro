import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/lib/rag/knowledge-service";
import { sessionManager } from "@/lib/session-manager";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function buildContextualSearchQuery(message: string, conversationHistory: any[]): string {
  // Get last 2 user messages to understand context
  const recentUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-2)
    .map(m => m.content);

  // If user is asking vague follow-up questions, enhance with context
  const vaguePatterns = /^(what about|how about|and|also|what's|tell me about)\s+(\w+)/i;

  if (vaguePatterns.test(message) && recentUserMessages.length > 0) {
    const lastMessage = recentUserMessages[recentUserMessages.length - 1];

    // Detect topic from previous message
    let topic = '';
    if (/cost|price|pricing|plans|pay|expensive/.test(lastMessage.toLowerCase())) {
      topic = 'pricing cost';
    } else if (/feature|capability|function|work|does/.test(lastMessage.toLowerCase())) {
      topic = 'features';
    } else if (/setup|install|implement|integrate/.test(lastMessage.toLowerCase())) {
      topic = 'setup implementation';
    } else if (/support|help|service/.test(lastMessage.toLowerCase())) {
      topic = 'support';
    }

    // Enhance search query with topic context
    return topic ? `${message} ${topic}` : message;
  }

  return message;
}

export async function POST(request: NextRequest) {
  try {
    const { message, tenantId, language = "en", sessionId } = await request.json();

    if (!message || !tenantId) {
      return NextResponse.json(
        { error: "Missing message or tenantId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get or create session
    let session = sessionId ? sessionManager.getSession(sessionId) : undefined;
    const finalSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!session && sessionId) {
      session = sessionManager.createSession(finalSessionId, tenantId);
    } else if (!session) {
      session = sessionManager.createSession(finalSessionId, tenantId);
    }

    // Get conversation history
    const conversationHistory = sessionManager.getMessages(finalSessionId);

    // Build context-aware search query
    const searchQuery = buildContextualSearchQuery(message, conversationHistory);

    // Search knowledge base with enhanced query
    const results = await knowledgeService.search(
      searchQuery,
      {
        tenantId: tenantId,
        product: ["smartchat", "phonebot", "shared"],
        language: language === "es" ? ["es", "en"] : ["en", "es"],
      },
      5
    );

    const knowledgeContext =
      results.length > 0
        ? results
            .map((r, i) => `[Source ${i + 1}: ${r.metadata?.source_title}]\n${r.content}`)
            .join("\n\n---\n\n")
        : "No specific knowledge found.";

    const systemPrompt = `You are a helpful AI assistant for Symtri AI's website.

BEHAVIOR GUIDELINES:
- Keep answers SHORT - 2 to 4 sentences maximum
- Be professional and friendly
- Match the user's language (English or Spanish)
- CRITICAL: When user asks "What about X?" or "And X?" maintain the SAME TOPIC as their previous question
  * If they asked about pricing before → give pricing for X
  * If they asked about features before → give features for X
  * If they asked about setup before → give setup info for X
- If asked about scheduling, provide the Calendly link: https://calendly.com/symtri-ai/30min
- If you don't know something, say: "I don't have that specific information, but I can connect you with someone who can help."

KNOWLEDGE BASE:
${knowledgeContext}

Answer the user's question based on the knowledge above and conversation history. Maintain topic consistency.`;

    // Build conversation messages for Claude
    const messages: Anthropic.MessageParam[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call Claude with full conversation context
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    const assistantResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save messages to session
    sessionManager.addMessage(finalSessionId, "user", message);
    sessionManager.addMessage(finalSessionId, "assistant", assistantResponse);

    // Extract unique sources
    const sources = [...new Set(results.map(r => r.metadata?.source_title).filter(Boolean))];

    return NextResponse.json(
      {
        response: assistantResponse,
        sources: sources,
        sourceCount: results.length,
        sessionId: finalSessionId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Chat failed: " + String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
