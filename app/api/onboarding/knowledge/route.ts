import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

interface FAQItem {
  question: string
  answer: string
}

// Parse FAQ content in Q&A format
function parseFAQContent(content: string): FAQItem[] {
  const items: FAQItem[] = []
  const lines = content.split('\n')

  let currentQuestion = ''
  let currentAnswer = ''

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.toLowerCase().startsWith('q:') || trimmedLine.toLowerCase().startsWith('question:')) {
      // Save previous Q&A if exists
      if (currentQuestion && currentAnswer) {
        items.push({
          question: currentQuestion.trim(),
          answer: currentAnswer.trim(),
        })
      }
      // Start new question
      currentQuestion = trimmedLine.replace(/^(q:|question:)/i, '').trim()
      currentAnswer = ''
    } else if (trimmedLine.toLowerCase().startsWith('a:') || trimmedLine.toLowerCase().startsWith('answer:')) {
      currentAnswer = trimmedLine.replace(/^(a:|answer:)/i, '').trim()
    } else if (currentAnswer !== '') {
      // Continue answer on multiple lines
      currentAnswer += ' ' + trimmedLine
    } else if (currentQuestion !== '' && trimmedLine !== '') {
      // Continue question on multiple lines
      currentQuestion += ' ' + trimmedLine
    }
  }

  // Add last Q&A
  if (currentQuestion && currentAnswer) {
    items.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim(),
    })
  }

  return items
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, type, content } = await request.json()

    if (!tenantId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, business_name')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    let chunksToInsert: Array<{
      tenant_id: string
      product: string[]
      content: string
      metadata: Record<string, unknown>
    }> = []

    if (type === 'faq') {
      // Parse FAQ content
      const faqs = parseFAQContent(content)

      if (faqs.length === 0) {
        return NextResponse.json(
          { error: 'No valid Q&A pairs found. Use format: Q: Question A: Answer' },
          { status: 400 }
        )
      }

      // Create chunks for each FAQ
      chunksToInsert = faqs.map((faq, index) => ({
        tenant_id: tenantId,
        product: ['smartchat'],
        content: `Question: ${faq.question}\n\nAnswer: ${faq.answer}`,
        metadata: {
          source_type: 'faq',
          source_title: `FAQ #${index + 1}`,
          question: faq.question,
          created_at: new Date().toISOString(),
        },
      }))
    } else if (type === 'website') {
      // For website import, we'll create a placeholder chunk
      // In production, you'd want to scrape the website
      chunksToInsert = [{
        tenant_id: tenantId,
        product: ['smartchat'],
        content: `Website information from ${content}. For detailed information, please visit: ${content}`,
        metadata: {
          source_type: 'website',
          source_title: tenant.business_name || 'Company Website',
          source_url: content,
          created_at: new Date().toISOString(),
        },
      }]
    }

    // Insert knowledge chunks
    const { error: insertError } = await supabase
      .from('knowledge_chunks')
      .insert(chunksToInsert)

    if (insertError) {
      console.error('Failed to insert knowledge chunks:', insertError)
      return NextResponse.json(
        { error: 'Failed to save knowledge' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      chunksCreated: chunksToInsert.length,
    })
  } catch (error) {
    console.error('Knowledge upload error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
