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

function getSourceInfo(content: string, product: string): { title: string; url: string } {
  const lowerContent = content.toLowerCase();

  let title = 'General Info';
  if (lowerContent.includes('pricing') || lowerContent.includes('setup fee')) {
    title = 'Pricing';
  } else if (lowerContent.includes('industries') || lowerContent.includes('healthcare')) {
    title = 'FAQ - Industries';
  } else if (lowerContent.includes('spanish') || lowerContent.includes('bilingual')) {
    title = 'FAQ - Languages';
  } else if (lowerContent.includes('integration') || lowerContent.includes('crm')) {
    title = 'FAQ - Integrations';
  } else if (lowerContent.includes('security') || lowerContent.includes('hipaa')) {
    title = 'FAQ - Security';
  } else if (lowerContent.includes('roi') || lowerContent.includes('return')) {
    title = 'FAQ - ROI';
  } else if (lowerContent.includes('contact') || lowerContent.includes('calendly')) {
    title = 'Contact Info';
  } else if (lowerContent.includes('24/7') || lowerContent.includes('ai-powered')) {
    title = 'Product Overview';
  }

  let url = 'https://symtri.ai';
  if (product === 'smartchat') {
    url = 'https://smartchat.symtri.ai';
  } else if (product === 'phonebot') {
    url = 'https://symtri.ai/phonebot';
  }

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
        match_threshold: filters.minSimilarity || 0.7,
        match_count: limit * 2, // Get more results for re-ranking
        filter_tenant_id: filters.tenantId,
        filter_products: filters.product,
        filter_languages: filters.language,
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
