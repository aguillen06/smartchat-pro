import { supabase } from './supabase';
import type { KnowledgeSearchResult } from '@/types/api';

/**
 * Search knowledge documents for relevant context
 *
 * This function performs a simple keyword-based search using PostgreSQL ILIKE.
 * In the future, this can be upgraded to use vector embeddings for semantic search.
 *
 * @param widgetId - UUID of the widget
 * @param query - User's search query
 * @param limit - Maximum number of results to return (default: 3)
 * @returns Array of relevant knowledge documents
 */
export async function searchKnowledge(
  widgetId: string,
  query: string,
  limit: number = 3
): Promise<KnowledgeSearchResult[]> {
  try {
    // Clean and prepare the search query
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2) // Only search terms longer than 2 chars
      .slice(0, 5); // Limit to first 5 terms for performance

    if (searchTerms.length === 0) {
      return [];
    }

    // Build ILIKE conditions for each search term
    // Search in content field for any of the terms
    let query_builder = supabase
      .from('knowledge_docs')
      .select('id, content, source_url, doc_type')
      .eq('widget_id', widgetId);

    // Create an OR condition for all search terms
    // Using ILIKE for case-insensitive pattern matching
    const orConditions = searchTerms
      .map((term) => `content.ilike.%${term}%`)
      .join(',');

    query_builder = query_builder.or(orConditions);

    // Execute query with limit
    const { data, error } = await query_builder.limit(limit * 2); // Get more initially

    if (error) {
      console.error('Error searching knowledge docs:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Simple relevance scoring based on term matches
    const scoredResults = data.map((doc) => {
      const contentLower = doc.content.toLowerCase();
      let score = 0;

      // Count how many search terms appear in the content
      searchTerms.forEach((term) => {
        const regex = new RegExp(term, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      return {
        ...doc,
        relevance_score: score,
      };
    });

    // Sort by relevance score (highest first)
    const sortedResults = scoredResults
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

    return sortedResults;
  } catch (error) {
    console.error('Unexpected error in knowledge search:', error);
    return [];
  }
}

/**
 * Get all knowledge documents for a widget
 *
 * @param widgetId - UUID of the widget
 * @returns Array of all knowledge documents
 */
export async function getAllKnowledgeDocs(
  widgetId: string
): Promise<KnowledgeSearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_docs')
      .select('id, content, source_url, doc_type')
      .eq('widget_id', widgetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all knowledge docs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching knowledge docs:', error);
    return [];
  }
}

/**
 * Format knowledge search results into context string for AI
 *
 * @param results - Array of knowledge search results
 * @returns Formatted context string
 */
export function formatKnowledgeContext(
  results: KnowledgeSearchResult[]
): string {
  if (results.length === 0) {
    return '';
  }

  const contextParts = results.map((result, index) => {
    let context = `[Source ${index + 1}`;
    if (result.source_url) {
      context += ` - ${result.source_url}`;
    }
    context += `]\n${result.content}`;
    return context;
  });

  return (
    'Here is relevant information from the knowledge base:\n\n' +
    contextParts.join('\n\n---\n\n')
  );
}
