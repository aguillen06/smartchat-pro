import { NextRequest, NextResponse } from "next/server";
import { knowledgeService } from "@/lib/rag/knowledge-service";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { message, tenantId, language = "en" } = await request.json();

    if (!message || !tenantId) {
      return NextResponse.json(
        { error: "Missing message or tenantId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Search knowledge base
    const results = await knowledgeService.search(
      message,
      {
        tenantId: tenantId,
        product: ["smartchat", "phonebot", "shared"],
        language: language === "es" ? ["es", "en"] : ["en", "es"],
      },
      5
    );

    // 2. Build context from results
    const knowledgeContext =
      results.length > 0
        ? results
            .map(
              (r, i) =>
                `[Source ${i + 1}]\n${r.content}`
            )
            .join("\n\n---\n\n")
        : "No specific knowledge found.";

    // 3. Build system prompt
    const systemPrompt = `You are a helpful AI assistant for Symtri AI's website.

BEHAVIOR GUIDELINES:
- Keep answers SHORT - 2 to 4 sentences maximum
- Be professional and friendly
- Match the user's language (English or Spanish)
- If asked about scheduling, provide the Calendly link: https://calendly.com/symtri-ai/30min
- If you don't know something, say: "I don't have that specific information, but I can connect you with someone who can help."

KNOWLEDGE BASE:
${knowledgeContext}

Answer the user's question based on the knowledge above.`;

    // 4. Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const assistantResponse =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json(
      {
        response: assistantResponse,
        sources: results.length,
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
