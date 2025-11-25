import Anthropic from '@anthropic-ai/sdk';

/**
 * Initialize Anthropic client with API key from environment
 */
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing ANTHROPIC_API_KEY environment variable. Please add it to your .env file.'
  );
}

export const anthropic = new Anthropic({
  apiKey,
});

/**
 * Configuration for chat responses
 * Using Claude 3 Haiku for speed, cost-efficiency, and better instruction following
 */
const DEFAULT_MODEL = 'claude-3-haiku-20240307';
const DEFAULT_MAX_TOKENS = 250; // Enough room to complete thoughts while staying concise

/**
 * Generate a chat response using Claude
 *
 * @param prompt - The user's message or question
 * @param context - Optional context to provide to the AI (e.g., business info, knowledge base)
 * @param systemPrompt - Optional system prompt to customize AI behavior
 * @returns The AI-generated response text
 * @throws Error if the API call fails
 */
export async function generateChatResponse(
  prompt: string,
  context?: string,
  systemPrompt?: string
): Promise<string> {
  try {
    // Build the user message with optional context
    let userMessage = prompt;
    if (context) {
      userMessage = `Context:\n${context}\n\nUser Question: ${prompt}`;
    }

    // Default system prompt for customer service
    const defaultSystemPrompt = `You are a helpful customer service chatbot. Keep your responses conversational and concise.

Response Guidelines:
- Keep answers to 2-3 sentences max for simple questions
- Only use bullet points when listing 3 or more items
- Be conversational, not formal - write like you're texting a friend
- End responses with a simple call-to-action when appropriate (e.g., "Want to learn more?", "Should I explain any of these?", "Need help with anything else?")
- If you don't know something, be honest and offer to help in other ways

Remember: Brief, friendly, and helpful.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt || defaultSystemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract text from the response
    const textContent = response.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Error generating chat response:', error);

    // Provide more specific error messages
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Anthropic API error (${error.status}): ${error.message}`
      );
    }

    throw new Error(
      `Failed to generate chat response: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Generate a chat response with conversation history
 *
 * @param messages - Array of conversation messages
 * @param systemPrompt - Optional system prompt to customize AI behavior
 * @returns The AI-generated response text
 */
export async function generateChatResponseWithHistory(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): Promise<string> {
  try {
    const defaultSystemPrompt = `You are a helpful customer service chatbot. Keep your responses conversational and concise.

Response Guidelines:
- Keep answers to 2-3 sentences max for simple questions
- Only use bullet points when listing 3 or more items
- Be conversational, not formal - write like you're texting a friend
- End responses with a simple call-to-action when appropriate (e.g., "Want to learn more?", "Should I explain any of these?", "Need help with anything else?")
- If you don't know something, be honest and offer to help in other ways

Remember: Brief, friendly, and helpful.`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt || defaultSystemPrompt,
      messages,
    });

    const textContent = response.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    return textContent.text;
  } catch (error) {
    console.error('Error generating chat response with history:', error);

    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Anthropic API error (${error.status}): ${error.message}`
      );
    }

    throw new Error(
      `Failed to generate chat response: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
