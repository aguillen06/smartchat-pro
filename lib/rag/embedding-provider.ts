// lib/rag/embedding-provider.ts
// Handles generating embeddings for RAG system

import OpenAI from "openai";

let openai: OpenAI;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private model = "text-embedding-ada-002";

  async embed(text: string): Promise<number[]> {
    const response = await getOpenAI().embeddings.create({
      model: this.model,
      input: text,
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // OpenAI allows up to 2048 inputs per request
    const batchSize = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await getOpenAI().embeddings.create({
        model: this.model,
        input: batch,
      });

      results.push(...response.data.map((d) => d.embedding));
    }

    return results;
  }
}

// Singleton instance
let embeddingProvider: EmbeddingProvider;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (!embeddingProvider) {
    embeddingProvider = new OpenAIEmbeddingProvider();
  }
  return embeddingProvider;
}
