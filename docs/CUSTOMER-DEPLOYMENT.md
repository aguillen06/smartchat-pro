# SmartChat Customer Deployment Guide

## Architecture Overview

SmartChat uses a multi-tenant RAG system:

```
TENANTS TABLE (isolates customers)
├── Symtri AI (tenant_id: c48decc4-98f5-4fe8-971f-5461d3e6ae1a)
├── Customer A, B, C...

KNOWLEDGE_CHUNKS TABLE (RAG with embeddings)
├── Chunks organized by tenant_id
├── doc_type: faq, pricing, service, about, cta, contact
├── product: shared, smartchat, phonebot
├── language: en, es
└── Embeddings via OpenAI text-embedding-ada-002

WIDGETS TABLE (chat configuration)
├── Widget per customer
├── system_prompt: AI behavior instructions  
├── settings: theme_color, welcome_message, business_description
└── Links to knowledge via tenant_id
```

## Deploying a New Customer

### Step 1: Create Tenant Record
```sql
INSERT INTO tenants (id, name, domain, settings)
VALUES (
  gen_random_uuid(),
  'Customer Name',
  'customer-domain.com', 
  '{"plan": "pro"}'
);
```

### Step 2: Create Widget
```sql
INSERT INTO widgets (
  id, customer_id, widget_key, name,
  settings, system_prompt, is_active
)
VALUES (
  gen_random_uuid(),
  'tenant_id_from_step_1',
  'customer-widget-key',
  'Customer Name Chat',
  '{"theme_color": "#0D9488", "business_name": "Customer Name", "welcome_message": "Hi! How can I help?"}',
  'You are a helpful assistant for Customer Name...',
  true
);
```

### Step 3: Ingest Customer Knowledge
Run ingestion script with customer's content:
```bash
npx ts-node scripts/ingest-customer-knowledge.ts --tenant=customer-tenant-id
```

### Step 4: Generate Widget Embed Code
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://smartchat.symtri.ai/widget.js';
    script.setAttribute('data-widget-key', 'customer-widget-key');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

### Step 5: Create Customer Login

Create a user in Supabase for dashboard access:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter customer email and password
4. Customer can log in at: `https://smartchat.symtri.ai/login`

**Auth URLs:**
- Login: `/login`
- Forgot Password: `/forgot-password`
- Reset Password: `/reset-password`
- Dashboard: `/dashboard`

---

## Symtri AI Configuration

**Tenant ID:** `c48decc4-98f5-4fe8-971f-5461d3e6ae1a`

**Current Business Model (Jan 2026):**
- One service, one price
- Setup: $2,997 one-time
- Monthly: $497/month
- Everything included

**Knowledge Locations:**
1. `widgets.system_prompt` - AI behavior
2. `widgets.settings.business_description` - Quick reference
3. `knowledge_docs` - Widget knowledge (keyword search)
4. `knowledge_chunks` - Tenant knowledge with embeddings (RAG)
