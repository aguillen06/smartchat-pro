-- SmartChat Pro Initial Database Schema
-- Created: 2024-11-23
-- Description: Creates all core tables for the SmartChat Pro SaaS platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- Stores business customers using the chatbot service
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    plan_type TEXT DEFAULT 'beta' CHECK (plan_type IN ('beta', 'starter', 'pro')),
    conversation_limit INTEGER DEFAULT 100,
    conversations_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WIDGETS TABLE
-- Chatbot instances that customers can embed on their sites
-- =====================================================
CREATE TABLE widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    widget_key TEXT UNIQUE NOT NULL,
    welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
    ai_instructions TEXT,
    primary_color TEXT DEFAULT '#0EA5E9',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- KNOWLEDGE_DOCS TABLE
-- Documents that provide context for AI responses
-- =====================================================
CREATE TABLE knowledge_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_url TEXT,
    doc_type TEXT CHECK (doc_type IN ('text', 'url', 'pdf', 'docx')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONVERSATIONS TABLE
-- Chat sessions between visitors and the AI
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lead_captured BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- MESSAGES TABLE
-- Individual messages within conversations
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEADS TABLE
-- Contact information captured from conversations
-- =====================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    widget_id UUID NOT NULL REFERENCES widgets(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    is_contacted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Widget indexes
CREATE INDEX idx_widgets_widget_key ON widgets(widget_key);
CREATE INDEX idx_widgets_customer_id ON widgets(customer_id);

-- Conversation indexes
CREATE INDEX idx_conversations_widget_id ON conversations(widget_id);
CREATE INDEX idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);

-- Message indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Lead indexes
CREATE INDEX idx_leads_widget_id ON leads(widget_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- Knowledge doc indexes
CREATE INDEX idx_knowledge_docs_widget_id ON knowledge_docs(widget_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates the updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to customers table
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to widgets table
CREATE TRIGGER update_widgets_updated_at
    BEFORE UPDATE ON widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE customers IS 'Business customers using the SmartChat Pro service';
COMMENT ON TABLE widgets IS 'Chatbot instances that can be embedded on customer websites';
COMMENT ON TABLE knowledge_docs IS 'Documents and content used to provide context for AI responses';
COMMENT ON TABLE conversations IS 'Chat sessions between website visitors and the AI assistant';
COMMENT ON TABLE messages IS 'Individual messages within a conversation';
COMMENT ON TABLE leads IS 'Contact information captured from conversations for follow-up';

COMMENT ON COLUMN customers.plan_type IS 'Subscription tier: beta, starter, or pro';
COMMENT ON COLUMN customers.conversation_limit IS 'Maximum conversations allowed per month';
COMMENT ON COLUMN customers.conversations_this_month IS 'Counter for current month usage';
COMMENT ON COLUMN widgets.widget_key IS 'Unique identifier used in the embed script';
COMMENT ON COLUMN widgets.ai_instructions IS 'Custom instructions for how the AI should behave';
COMMENT ON COLUMN conversations.visitor_id IS 'Anonymous identifier for the website visitor';
COMMENT ON COLUMN messages.role IS 'Message sender: user or assistant';
