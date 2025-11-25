-- SmartChat Pro Development Seed Data
-- Created: 2024-11-23
-- Description: Sample data for local development and testing

-- =====================================================
-- SAMPLE CUSTOMERS
-- =====================================================

-- Customer 1: Tech Startup
INSERT INTO customers (id, business_name, email, plan_type, conversation_limit, conversations_this_month)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'TechStart Solutions',
    'contact@techstart.example.com',
    'pro',
    1000,
    42
);

-- Customer 2: E-commerce Store
INSERT INTO customers (id, business_name, email, plan_type, conversation_limit, conversations_this_month)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'ShopEase Store',
    'support@shopease.example.com',
    'starter',
    100,
    15
);

-- =====================================================
-- SAMPLE WIDGETS
-- =====================================================

-- Widget for TechStart Solutions
INSERT INTO widgets (id, customer_id, widget_key, welcome_message, ai_instructions, primary_color, is_active)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'techstart_widget_key_demo',
    'Welcome to TechStart Solutions! How can we help you with our SaaS platform today?',
    'You are a helpful assistant for TechStart Solutions, a SaaS company providing project management tools. Be professional, concise, and focus on how our platform can solve their business problems. Key features: task management, team collaboration, time tracking, and analytics.',
    '#6366F1',
    TRUE
);

-- Widget for ShopEase Store
INSERT INTO widgets (id, customer_id, widget_key, welcome_message, ai_instructions, primary_color, is_active)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'shopease_widget_key_demo',
    'Hi there! 👋 Welcome to ShopEase. What can I help you find today?',
    'You are a friendly shopping assistant for ShopEase, an online retail store. Help customers find products, answer questions about shipping, returns, and sizing. Be warm and helpful. We offer free shipping over $50 and 30-day returns.',
    '#10B981',
    TRUE
);

-- =====================================================
-- SAMPLE KNOWLEDGE DOCS
-- =====================================================

-- Knowledge docs for TechStart
INSERT INTO knowledge_docs (widget_id, content, doc_type, source_url)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TechStart Solutions Pricing: Starter Plan - $29/month for up to 10 users. Professional Plan - $79/month for up to 50 users. Enterprise Plan - Custom pricing for unlimited users. All plans include 24/7 support and SSL security.',
    'text',
    'https://techstart.example.com/pricing'
);

INSERT INTO knowledge_docs (widget_id, content, doc_type, source_url)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TechStart Features: Real-time collaboration, Gantt charts, Kanban boards, Time tracking, Custom workflows, API access, Mobile apps (iOS & Android), Integrations with Slack, GitHub, and Jira.',
    'text',
    'https://techstart.example.com/features'
);

-- Knowledge docs for ShopEase
INSERT INTO knowledge_docs (widget_id, content, doc_type, source_url)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ShopEase Shipping Policy: Free shipping on orders over $50. Standard shipping (5-7 business days) - $5.99. Express shipping (2-3 business days) - $12.99. International shipping available to select countries.',
    'text',
    'https://shopease.example.com/shipping'
);

INSERT INTO knowledge_docs (widget_id, content, doc_type, source_url)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ShopEase Return Policy: 30-day money-back guarantee on all items. Items must be unused and in original packaging. Free return shipping for defective items. Refunds processed within 5-7 business days.',
    'text',
    'https://shopease.example.com/returns'
);

-- =====================================================
-- SAMPLE CONVERSATIONS
-- =====================================================

-- Conversation 1 for TechStart
INSERT INTO conversations (id, widget_id, visitor_id, started_at, lead_captured, last_message_at)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'visitor_tech_001',
    NOW() - INTERVAL '2 hours',
    TRUE,
    NOW() - INTERVAL '2 hours'
);

-- Conversation 2 for ShopEase
INSERT INTO conversations (id, widget_id, visitor_id, started_at, lead_captured, last_message_at)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'visitor_shop_001',
    NOW() - INTERVAL '1 hour',
    FALSE,
    NOW() - INTERVAL '1 hour'
);

-- =====================================================
-- SAMPLE MESSAGES
-- =====================================================

-- Messages for TechStart conversation
INSERT INTO messages (conversation_id, role, content, created_at)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', 'What pricing plans do you offer?', NOW() - INTERVAL '2 hours'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', 'We offer three pricing plans: Starter Plan at $29/month for up to 10 users, Professional Plan at $79/month for up to 50 users, and Enterprise Plan with custom pricing for unlimited users. All plans include 24/7 support and SSL security. Which plan would work best for your team?', NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', 'The Professional plan sounds good. Can I schedule a demo?', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute');

-- Messages for ShopEase conversation
INSERT INTO messages (conversation_id, role, content, created_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'user', 'What is your return policy?', NOW() - INTERVAL '1 hour'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'assistant', 'We have a 30-day money-back guarantee on all items! Items must be unused and in original packaging. We offer free return shipping for defective items, and refunds are processed within 5-7 business days. Is there a specific item you have questions about?', NOW() - INTERVAL '1 hour' + INTERVAL '20 seconds');

-- =====================================================
-- SAMPLE LEADS
-- =====================================================

-- Lead from TechStart conversation
INSERT INTO leads (conversation_id, widget_id, name, email, phone, message, is_contacted)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'John Smith',
    'john.smith@company.example.com',
    '+1-555-0123',
    'Interested in scheduling a demo for the Professional plan for our 25-person team',
    FALSE
);

-- =====================================================
-- VERIFICATION QUERIES (commented out)
-- =====================================================

-- Uncomment these to verify the seed data was inserted correctly:
-- SELECT COUNT(*) as customer_count FROM customers;
-- SELECT COUNT(*) as widget_count FROM widgets;
-- SELECT COUNT(*) as knowledge_doc_count FROM knowledge_docs;
-- SELECT COUNT(*) as conversation_count FROM conversations;
-- SELECT COUNT(*) as message_count FROM messages;
-- SELECT COUNT(*) as lead_count FROM leads;
