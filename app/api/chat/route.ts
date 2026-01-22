import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/lib/rag/knowledge-service";
import { sessionManager } from "@/lib/session-manager";
import { notifyNewLead } from "@/lib/webhooks/automation";
import { resolveTenantId } from "@/lib/tenant-resolver";
import Anthropic from "@anthropic-ai/sdk";

// Lead detection patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;
const NAME_PATTERNS = /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;

interface DetectedLead {
  email?: string;
  phone?: string;
  name?: string;
}

function detectLeadInfo(message: string): DetectedLead {
  const lead: DetectedLead = {};

  const emailMatch = message.match(EMAIL_REGEX);
  if (emailMatch) lead.email = emailMatch[0];

  const phoneMatch = message.match(PHONE_REGEX);
  if (phoneMatch) lead.phone = phoneMatch[0].replace(/[-.\s]/g, '');

  const nameMatch = message.match(NAME_PATTERNS);
  if (nameMatch) lead.name = nameMatch[1];

  return lead;
}

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

interface ConversationMessage {
  role: string;
  content: string;
}

function detectPricingContext(message: string, conversationHistory: ConversationMessage[]): boolean {
  // Check if current message is about pricing
  const pricingKeywords = /cost|price|pricing|plans|pay|expensive|afford|fee|subscription|monthly|charges/i;
  if (pricingKeywords.test(message)) return true;

  // Check if recent conversation was about pricing
  const recentMessages = conversationHistory.slice(-4); // Last 2 exchanges
  return recentMessages.some(m => pricingKeywords.test(m.content));
}

function buildContextualSearchQuery(message: string, conversationHistory: ConversationMessage[]): string {
  const recentUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .slice(-2)
    .map(m => m.content);

  const vaguePatterns = /^(what about|how about|and|also|what's|tell me about)\s+(\w+)/i;

  if (vaguePatterns.test(message) && recentUserMessages.length > 0) {
    const lastMessage = recentUserMessages[recentUserMessages.length - 1];

    let topic = '';
    if (/cost|price|pricing|plans|pay|expensive/.test(lastMessage.toLowerCase())) {
      topic = 'pricing cost plans';
    } else if (/feature|capability|function|work|does/.test(lastMessage.toLowerCase())) {
      topic = 'features capabilities';
    } else if (/setup|install|implement|integrate/.test(lastMessage.toLowerCase())) {
      topic = 'setup implementation';
    } else if (/support|help|service/.test(lastMessage.toLowerCase())) {
      topic = 'support service';
    }

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

    // Resolve tenant slug to UUID using dynamic resolver
    const resolvedTenantId = await resolveTenantId(tenantId);

    if (!resolvedTenantId) {
      return NextResponse.json(
        { error: "Invalid tenant" },
        { status: 404, headers: corsHeaders }
      );
    }

    // OPTIMIZED: Simplified session creation logic
    const finalSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const existingSession = sessionManager.getSession(finalSessionId);
    if (!existingSession) {
      sessionManager.createSession(finalSessionId, resolvedTenantId);
    }

    const conversationHistory = sessionManager.getMessages(finalSessionId);

    // Detect if user wants pricing info
    const isPricingContext = detectPricingContext(message, conversationHistory);

    // Build context-aware search query
    const searchQuery = buildContextualSearchQuery(message, conversationHistory);

    // Search with pricing boost if context suggests it
    const results = await knowledgeService.search(
      searchQuery,
      {
        tenantId: resolvedTenantId,
        product: ["smartchat", "phonebot", "shared"],
        language: language === "es" ? ["es", "en"] : ["en", "es"],
      },
      5,
      isPricingContext // Boost pricing chunks
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
- CRITICAL: When user asks "What about X?" maintain the SAME TOPIC as previous question
  * If previous was about PRICING → give PRICING for X
  * If previous was about features → give features for X
- If asked about scheduling, provide: https://calendly.com/symtri-ai/30min
- If you don't know something, say: "I don't have that specific information, but I can connect you with someone who can help."

KNOWLEDGE BASE:
${knowledgeContext}

Answer based on knowledge above and conversation history. Maintain topic consistency.`;

    const messages: Anthropic.MessageParam[] = conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    messages.push({
      role: "user",
      content: message,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages,
    });

    const assistantResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    sessionManager.addMessage(finalSessionId, "user", message);
    sessionManager.addMessage(finalSessionId, "assistant", assistantResponse);

    // Detect lead info and send to automation hub
    const leadInfo = detectLeadInfo(message);
    if (leadInfo.email || leadInfo.phone) {
      // Non-blocking webhook call
      notifyNewLead({
        ...leadInfo,
        source: 'smartchat',
        sessionId: finalSessionId,
        messages: conversationHistory.map(m => m.content)
      }).catch(err => console.error('Lead webhook error:', err));
    }

    // OPTIMIZED: Deduplicate sources efficiently
    const sourceSet = new Set<string>();
    const sources: string[] = [];
    for (const r of results) {
      const title = r.metadata?.source_title;
      if (title && !sourceSet.has(title)) {
        sourceSet.add(title);
        sources.push(title);
      }
    }

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
