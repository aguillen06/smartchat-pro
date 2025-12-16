// lib/rag/knowledge-service.ts
// Handles searching and ingesting knowledge chunks

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getEmbeddingProvider } from "./embedding-provider";

export interface KnowledgeChunk {
  id: string;
  content: string;
  section_title?: string;
  doc_type: string;
  product: string;
  language: string;
  similarity?: number;
  tags?: string[];
}

export interface SearchFilters {
  tenantId: string;
  product?: string[];
  language?: string[];
  docType?: string[];
  confidentiality?: string[];
  minSimilarity?: number;
}

export interface IngestOptions {
  tenantId: string;
  docType: string;
  product?: string;
  language?: string;
  sectionTitle?: string;
  sourceUrl?: string;
  tags?: string[];
}

// Knowledge Service Class
export class KnowledgeService {
  private supabase: SupabaseClient;
  private embeddings = getEmbeddingProvider();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for backend
    );
  }

  // Search knowledge base
  async search(
    query: string,
    filters: SearchFilters,
    limit = 5
  ): Promise<KnowledgeChunk[]> {
    // 1. Embed the query
    const queryEmbedding = await this.embeddings.embed(query);

    // 2. Call search function
    const { data, error } = await this.supabase.rpc("search_knowledge", {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter_tenant: filters.tenantId,
      filter_product: filters.product || null,
      filter_language: filters.language || null,
      filter_doc_type: filters.docType || null,
      min_similarity: filters.minSimilarity || 0.65,
    });

    if (error) {
      console.error("Knowledge search error:", error);
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  }

  // Ingest new knowledge
  async ingest(content: string, options: IngestOptions): Promise<string> {
    // 1. Generate embedding
    const embedding = await this.embeddings.embed(content);

    // 2. Store chunk
    const { data, error } = await this.supabase.rpc("upsert_knowledge_chunk", {
      p_tenant_id: options.tenantId,
      p_content: content,
      p_doc_type: options.docType,
      p_product: options.product || "shared",
      p_language: options.language || "en",
      p_section_title: options.sectionTitle || null,
      p_source_url: options.sourceUrl || null,
      p_tags: options.tags || [],
      p_embedding: embedding,
    });

    if (error) {
      console.error("Knowledge ingest error:", error);
      throw new Error(`Ingest failed: ${error.message}`);
    }

    return data;
  }

  // Bulk ingest (for initial setup or imports)
  async ingestBatch(
    chunks: Array<{ content: string; options: IngestOptions }>
  ): Promise<string[]> {
    const ids: string[] = [];

    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const contents = batch.map((c) => c.content);
      const embeddings = await this.embeddings.embedBatch(contents);

      for (let j = 0; j < batch.length; j++) {
        const { data, error } = await this.supabase.rpc(
          "upsert_knowledge_chunk",
          {
            p_tenant_id: batch[j].options.tenantId,
            p_content: batch[j].content,
            p_doc_type: batch[j].options.docType,
            p_product: batch[j].options.product || "shared",
            p_language: batch[j].options.language || "en",
            p_section_title: batch[j].options.sectionTitle || null,
            p_source_url: batch[j].options.sourceUrl || null,
            p_tags: batch[j].options.tags || [],
            p_embedding: embeddings[j],
          }
        );

        if (error) {
          console.error(`  ❌ Failed to ingest chunk ${i + j + 1}:`, error.message);
        } else if (data) {
          ids.push(data);
          console.log(`  ✓ Ingested chunk ${i + j + 1}`);
        } else {
          console.warn(`  ⚠ No data returned for chunk ${i + j + 1}`);
        }
      }
    }

    return ids;
  }

  // Approve a draft chunk
  async approve(chunkId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from("knowledge_chunks")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", chunkId)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Approve failed: ${error.message}`);
    }
  }

  // Archive a chunk
  async archive(chunkId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from("knowledge_chunks")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", chunkId)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Archive failed: ${error.message}`);
    }
  }

  // List all knowledge for admin UI
  async listForTenant(
    tenantId: string,
    options?: {
      status?: string;
      product?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<KnowledgeChunk[]> {
    const { data, error } = await this.supabase.rpc("get_tenant_knowledge", {
      p_tenant_id: tenantId,
      p_status: options?.status || null,
      p_product: options?.product || null,
      p_limit: options?.limit || 100,
      p_offset: options?.offset || 0,
    });

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data || [];
  }
}

// Singleton export (lazy initialization)
let _knowledgeService: KnowledgeService | null = null;

export const knowledgeService = {
  get instance(): KnowledgeService {
    if (!_knowledgeService) {
      _knowledgeService = new KnowledgeService();
    }
    return _knowledgeService;
  },
  search: (...args: Parameters<KnowledgeService["search"]>) =>
    knowledgeService.instance.search(...args),
  ingest: (...args: Parameters<KnowledgeService["ingest"]>) =>
    knowledgeService.instance.ingest(...args),
  ingestBatch: (...args: Parameters<KnowledgeService["ingestBatch"]>) =>
    knowledgeService.instance.ingestBatch(...args),
  approve: (...args: Parameters<KnowledgeService["approve"]>) =>
    knowledgeService.instance.approve(...args),
  archive: (...args: Parameters<KnowledgeService["archive"]>) =>
    knowledgeService.instance.archive(...args),
  listForTenant: (...args: Parameters<KnowledgeService["listForTenant"]>) =>
    knowledgeService.instance.listForTenant(...args),
};
