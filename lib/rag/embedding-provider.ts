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
    if (texts.length === 0) return [];

    // OpenAI allows up to 2048 inputs per request
    const batchSize = 100;

    // OPTIMIZED: Split into batches first
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    // OPTIMIZED: Process all batches in parallel instead of sequentially
    const responses = await Promise.all(
      batches.map(batch =>
        getOpenAI().embeddings.create({
          model: this.model,
          input: batch,
        })
      )
    );

    // Flatten results in order
    return responses.flatMap(response => response.data.map(d => d.embedding));
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
