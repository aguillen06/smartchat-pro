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

    // Search knowledge base
    const results = await knowledgeService.search(
      message,
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
- Use conversation context to provide relevant follow-up responses
- If asked about scheduling, provide the Calendly link: https://calendly.com/symtri-ai/30min
- If you don't know something, say: "I don't have that specific information, but I can connect you with someone who can help."

KNOWLEDGE BASE:
${knowledgeContext}

Answer the user's question based on the knowledge above and the conversation history.`;

    // Build conversation history for Claude
    const conversationHistory = sessionManager.getMessages(finalSessionId);
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
