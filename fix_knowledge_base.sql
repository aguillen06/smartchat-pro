-- Fix Knowledge Base Schema and Add Symtri AI Info
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to knowledge_docs table
ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_knowledge_docs_updated_at ON knowledge_docs;
CREATE TRIGGER update_knowledge_docs_updated_at
    BEFORE UPDATE ON knowledge_docs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Insert Symtri AI company information
INSERT INTO knowledge_docs (widget_id, title, content, updated_at)
SELECT
    id,
    'Symtri AI Company Information',
    '# Symtri AI Company Information

## Company Overview
Symtri AI is an AI automation company helping small businesses streamline their operations and grow faster. We specialize in practical, affordable AI solutions that deliver real results.

## Products & Services

### SmartChat Pro (AI Chatbot)
- 24/7 customer support automation
- Lead capture and qualification
- Knowledge base integration
- Custom branding and white-label options
- Starting at $99/month

### PhoneBot AI (Voice AI)
- AI-powered phone answering system
- Natural conversations with customers
- Appointment scheduling
- Call routing and transfers
- Voicemail transcription
- Starting at $149/month

### LeadFlow AI (Lead Management)
- Automated lead capture from multiple sources
- Lead scoring and prioritization
- Follow-up automation
- CRM integration
- Starting at $79/month

### ProcessPilot (Document Processing)
- Intelligent document scanning and extraction
- Invoice processing and data entry automation
- Form processing
- Custom workflows
- Starting at $129/month

## Target Market
Small to medium-sized businesses looking to:
- Reduce operational costs
- Improve customer service
- Automate repetitive tasks
- Scale without hiring more staff

## Location
Based in South Texas, serving clients nationwide

## Contact
- Website: symtri.ai
- Business Hours: Mon-Fri, 9am-5pm Central
- 24/7 chatbot support available

## Key Differentiators
1. Affordable pricing for small businesses
2. Fast implementation (1-2 weeks)
3. No technical expertise required
4. Ongoing support and training included
5. Month-to-month contracts (no long-term commitment)',
    NOW()
FROM widgets
WHERE widget_key = 'demo_widget_key_123'
LIMIT 1;

-- 4. Verify the changes
SELECT
    'Schema updated successfully!' as status,
    COUNT(*) as total_docs
FROM knowledge_docs;

-- 5. Show the inserted document
SELECT id, title, LEFT(content, 100) as content_preview, created_at, updated_at
FROM knowledge_docs
ORDER BY created_at DESC
LIMIT 1;
