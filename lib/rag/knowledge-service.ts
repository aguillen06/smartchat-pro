import { supabase } from "@/lib/supabase/client";
import { getEmbeddingProvider } from "./embedding-provider";

const embeddingProvider = getEmbeddingProvider();

export interface KnowledgeSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: {
    product: string;
    language: string;
    source_title?: string;
    source_url?: string;
  };
}

export interface SearchFilters {
  tenantId?: string;
  product?: string[];
  language?: string[];
  minSimilarity?: number;
}

// OPTIMIZED: Pre-compiled regex patterns for single-pass matching
// Each pattern uses alternation (|) to check multiple keywords in one regex test
const SOURCE_PATTERNS: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /pricing|setup fee/i, title: 'Pricing' },
  { pattern: /industries|healthcare/i, title: 'FAQ - Industries' },
  { pattern: /spanish|bilingual/i, title: 'FAQ - Languages' },
  { pattern: /integration|crm/i, title: 'FAQ - Integrations' },
  { pattern: /security|hipaa/i, title: 'FAQ - Security' },
  { pattern: /\broi\b|return/i, title: 'FAQ - ROI' },
  { pattern: /contact|calendly/i, title: 'Contact Info' },
  { pattern: /24\/7|ai-powered/i, title: 'Product Overview' },
];

// OPTIMIZED: URL map for O(1) lookup instead of if-else chain
const PRODUCT_URLS: Record<string, string> = {
  smartchat: 'https://smartchat.symtri.ai',
  phonebot: 'https://symtri.ai/phonebot',
};

function getSourceInfo(content: string, product: string): { title: string; url: string } {
  // OPTIMIZED: Single regex test per pattern instead of multiple includes()
  let title = 'General Info';
  for (const { pattern, title: patternTitle } of SOURCE_PATTERNS) {
    if (pattern.test(content)) {
      title = patternTitle;
      break;
    }
  }

  const url = PRODUCT_URLS[product] || 'https://symtri.ai';

  return { title, url };
}

class KnowledgeService {
  async search(
    query: string,
    filters: SearchFilters = {},
    limit: number = 5,
    boostPricing: boolean = false
  ): Promise<KnowledgeSearchResult[]> {
    try {
      const embedding = await embeddingProvider.embed(query);

      const { data, error } = await supabase.rpc("search_knowledge", {
        query_embedding: embedding,
        min_similarity: filters.minSimilarity || 0.7,
        match_count: limit * 2, // Get more results for re-ranking
        filter_tenant: filters.tenantId,
        filter_product: filters.product,
        filter_language: filters.language,
      });

      if (error) throw error;

      let results = (data || []).map((item: any) => {
        const sourceInfo = getSourceInfo(item.content, item.product);
        let similarity = item.similarity;

        // Boost pricing chunks if context suggests user wants pricing
        if (boostPricing && sourceInfo.title === 'Pricing') {
          similarity = Math.min(similarity * 1.5, 1.0); // 50% boost, max 1.0
        }

        return {
          id: item.id,
          content: item.content,
          similarity: similarity,
          metadata: {
            product: item.product,
            language: item.language,
            source_title: sourceInfo.title,
            source_url: sourceInfo.url,
          },
        };
      });

      // Re-sort by boosted similarity
      results.sort((a: KnowledgeSearchResult, b: KnowledgeSearchResult) => b.similarity - a.similarity);

      // Return top results
      return results.slice(0, limit);
    } catch (error) {
      console.error("Knowledge search error:", error);
      return [];
    }
  }

  async upsert(
    tenantId: string,
    product: string,
    language: string,
    content: string
  ): Promise<void> {
    try {
      const embedding = await embeddingProvider.embed(content);

      const { error } = await supabase.rpc("upsert_knowledge_chunk", {
        p_tenant_id: tenantId,
        p_product: product,
        p_language: language,
        p_content: content,
        p_embedding: embedding,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Knowledge upsert error:", error);
      throw error;
    }
  }
}

export const knowledgeService = new KnowledgeService();
