# SmartChat Onboarding - Technical Architecture

> Deep dive into the technical implementation of the unified customer onboarding system.

**Last Updated:** January 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Authentication System](#authentication-system)
4. [File Structure](#file-structure)
5. [Key Components](#key-components)
6. [Data Flow](#data-flow)
7. [Security Model](#security-model)
8. [Multi-Tenant Design](#multi-tenant-design)

---

## Architecture Overview

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js App Router (React 19)                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  /login  │  │ /signup  │  │/dashboard│  │ /onboarding/*    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │             │             │                  │              │
│       └─────────────┴─────────────┴──────────────────┘              │
│                              │                                       │
│                    createBrowserSupabaseClient()                     │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                         MIDDLEWARE                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  middleware.ts                                               │    │
│  │  - Route protection (/dashboard, /settings, /onboarding)    │    │
│  │  - Auth redirect (login/signup → dashboard if logged in)    │    │
│  │  - Session refresh                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────┐
│                         API ROUTES                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │/api/auth/*  │  │/api/stripe/*│  │  /api/onboarding/*          │  │
│  │  - signup   │  │  - checkout │  │  - knowledge                │  │
│  └──────┬──────┘  │  - webhook  │  │  - widget                   │  │
│         │         │  - portal   │  └──────────────┬──────────────┘  │
│         │         └──────┬──────┘                 │                  │
│         │                │                        │                  │
│    createAdminSupabaseClient()              createServerSupabaseClient()
└─────────┼────────────────┼────────────────────────┼──────────────────┘
          │                │                        │
┌─────────┴────────────────┴────────────────────────┴──────────────────┐
│                         EXTERNAL SERVICES                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │   Supabase Auth  │  │  Supabase DB     │  │      Stripe       │  │
│  │   - Sessions     │  │  - tenants       │  │  - Checkout       │  │
│  │   - Magic Links  │  │  - users         │  │  - Subscriptions  │  │
│  │   - Password     │  │  - subscriptions │  │  - Webhooks       │  │
│  └──────────────────┘  └──────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Inline CSS (no external framework) |
| Auth | Supabase Auth with `@supabase/ssr` |
| Database | PostgreSQL (Supabase) with RLS |
| Payments | Stripe Checkout + Webhooks |
| Hosting | Vercel (Edge + Serverless) |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │     tenants     │       │  subscriptions  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │       │ user_id (FK)    │
│ ...             │       │ slug (UNIQUE)   │       │ tenant_id (FK)──┼──┐
└────────┬────────┘       │ business_name   │       │ stripe_*        │  │
         │                │ products (JSONB)│       │ plan            │  │
         │                │ status          │       │ status          │  │
         │                │ onboarding_*    │       └─────────────────┘  │
         │                └────────┬────────┘                            │
         │                         │                                     │
         │    ┌────────────────────┘                                     │
         │    │                                                          │
         ▼    ▼                                                          │
┌─────────────────┐                                                      │
│     users       │                                                      │
├─────────────────┤                                                      │
│ id (PK)         │                                                      │
│ auth_user_id(FK)│──── References auth.users.id                        │
│ tenant_id (FK)  │──── References tenants.id ◄──────────────────────────┘
│ email           │
│ first_name      │
│ last_name       │
│ role            │
└─────────────────┘
```

### Tenants Table

```sql
CREATE TABLE public.tenants (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- Used in widget embed codes

  -- Business Info
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  website_url TEXT,
  phone VARCHAR(50),

  -- Billing
  stripe_customer_id TEXT UNIQUE,

  -- Product Access (expandable for PhoneBot, etc.)
  products JSONB DEFAULT '{"smartchat": false, "phonebot": false}'::jsonb,

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  language VARCHAR(10) DEFAULT 'en',

  -- Status & Lifecycle
  status VARCHAR(50) DEFAULT 'pending',  -- pending, trial, active, suspended, cancelled
  trial_ends_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Users Table Extensions

```sql
ALTER TABLE public.users
  ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN role VARCHAR(50) DEFAULT 'owner',  -- owner, admin, member
  ADD COLUMN first_name VARCHAR(100),
  ADD COLUMN last_name VARCHAR(100);
```

### Subscriptions Table Extensions

```sql
ALTER TABLE public.subscriptions
  ADD COLUMN tenant_id UUID REFERENCES public.tenants(id),
  ADD COLUMN product VARCHAR(50) DEFAULT 'smartchat';  -- smartchat, phonebot
```

---

## Authentication System

### Supabase Client Architecture

The system uses three different Supabase clients for different contexts:

```typescript
// lib/supabase/browser.ts - Client Components
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts - Server Components & API Routes
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => cookies.forEach(c => cookieStore.set(c))
    }
  })
}

// lib/supabase/server.ts - Admin Operations (bypasses RLS)
export function createAdminSupabaseClient() {
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

### Client Usage by Context

| Context | Client | Key | RLS |
|---------|--------|-----|-----|
| Client Components | `createBrowserSupabaseClient()` | Anon | Yes |
| Server Components | `createServerSupabaseClient()` | Anon | Yes |
| API Routes (user ops) | `createServerSupabaseClient()` | Anon | Yes |
| API Routes (admin ops) | `createAdminSupabaseClient()` | Service Role | No |
| Webhooks | `createAdminSupabaseClient()` | Service Role | No |

### Middleware Flow

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Create Supabase client with cookie handling
  const supabase = createServerClient(url, key, { cookies: {...} })

  // 2. Refresh session (important for SSR)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Route protection
  if (isProtectedRoute && !user) {
    return redirect('/login?redirectTo=' + pathname)
  }

  // 4. Auth route redirect (logged in users)
  if (isAuthRoute && user) {
    return redirect('/dashboard')
  }

  return response
}

// Protected routes
const protectedRoutes = ['/dashboard', '/settings', '/onboarding']
const authRoutes = ['/login', '/signup']
```

---

## File Structure

```
smartchat-pro/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── signup/
│   │   │       └── route.ts        # Create tenant + user records
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts        # Create Stripe checkout session
│   │   │   ├── webhook/
│   │   │   │   └── route.ts        # Handle Stripe events
│   │   │   ├── portal/
│   │   │   │   └── route.ts        # Billing portal redirect
│   │   │   └── subscription/
│   │   │       └── route.ts        # Get subscription status
│   │   ├── onboarding/
│   │   │   ├── knowledge/
│   │   │   │   └── route.ts        # Save knowledge base
│   │   │   └── widget/
│   │   │       └── route.ts        # Save widget config
│   │   └── chat/
│   │       └── route.ts            # Chat API (uses tenant resolver)
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts            # Handle auth redirects
│   │
│   ├── login/
│   │   └── page.tsx                # Login page with forgot password
│   ├── signup/
│   │   └── page.tsx                # 2-step signup (account → payment)
│   ├── forgot-password/
│   │   └── page.tsx                # Request password reset
│   ├── reset-password/
│   │   └── page.tsx                # Set new password
│   │
│   ├── onboarding/
│   │   ├── layout.tsx              # Progress indicator wrapper
│   │   ├── business/
│   │   │   └── page.tsx            # Step 1: Business details
│   │   ├── knowledge/
│   │   │   └── page.tsx            # Step 2: Knowledge upload
│   │   ├── widget/
│   │   │   └── page.tsx            # Step 3: Widget config
│   │   └── install/
│   │       └── page.tsx            # Step 4: Embed code
│   │
│   └── dashboard/
│       └── page.tsx                # Main dashboard (uses tenant context)
│
├── lib/
│   ├── supabase/
│   │   ├── browser.ts              # Browser client
│   │   ├── server.ts               # Server + Admin clients
│   │   └── auth.ts                 # Re-exports for convenience
│   │
│   ├── tenant-resolver.ts          # Dynamic tenant lookup with caching
│   └── access-control.ts           # Product access utilities
│
├── middleware.ts                   # Route protection
│
└── supabase/
    └── migrations/
        ├── 004_unified_tenants.sql
        ├── 005_link_users_auth.sql
        └── 006_subscriptions_tenant.sql
```

---

## Key Components

### Tenant Resolver

Replaces hardcoded tenant mapping with dynamic database lookup:

```typescript
// lib/tenant-resolver.ts
const tenantCache = new Map<string, { id: string; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000  // 5 minutes

export async function resolveTenantId(slugOrId: string): Promise<string | null> {
  // Check cache first
  const cached = tenantCache.get(slugOrId)
  if (cached && cached.expires > Date.now()) {
    return cached.id
  }

  // UUID format - return as-is
  if (isValidUUID(slugOrId)) {
    return slugOrId
  }

  // Lookup by slug
  const { data } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slugOrId)
    .single()

  if (data) {
    tenantCache.set(slugOrId, { id: data.id, expires: Date.now() + CACHE_TTL })
    return data.id
  }

  return null
}
```

### Signup API

Creates tenant and user records using admin client:

```typescript
// app/api/auth/signup/route.ts
export async function POST(request: Request) {
  const { authUserId, email, businessName, slug } = await request.json()

  const supabase = createAdminSupabaseClient()  // Bypasses RLS

  // 1. Create tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .insert({
      name: businessName,
      slug: slug,
      business_name: businessName,
      status: 'pending',
      products: { smartchat: false, phonebot: false }
    })
    .select()
    .single()

  // 2. Create user linked to auth + tenant
  await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      tenant_id: tenant.id,
      email: email,
      role: 'owner'
    })

  return Response.json({ tenantId: tenant.id })
}
```

### Stripe Webhook Handler

Processes checkout completion and subscription updates:

```typescript
// app/api/stripe/webhook/route.ts (simplified)
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenant_id
  const customerEmail = session.customer_email

  const supabase = createAdminSupabaseClient()

  // Create subscription record
  await supabase.from('subscriptions').insert({
    tenant_id: tenantId,
    stripe_subscription_id: session.subscription,
    stripe_customer_id: session.customer,
    plan: determinePlan(session),
    status: 'trialing',
    product: 'smartchat'
  })

  // Update tenant
  await supabase.from('tenants').update({
    status: 'trial',
    stripe_customer_id: session.customer,
    products: { smartchat: true, phonebot: false },
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  }).eq('id', tenantId)
}
```

---

## Data Flow

### Signup Flow Sequence

```
┌──────┐     ┌──────┐     ┌─────────┐     ┌────────┐     ┌────────┐
│Client│     │Signup│     │Auth API │     │Checkout│     │Webhook │
│      │     │ Page │     │         │     │  API   │     │  API   │
└──┬───┘     └──┬───┘     └────┬────┘     └───┬────┘     └───┬────┘
   │            │              │              │              │
   │ 1. Fill form              │              │              │
   ├──────────►│               │              │              │
   │            │              │              │              │
   │            │ 2. signUp()  │              │              │
   │            ├─────────────►│              │              │
   │            │              │              │              │
   │            │ 3. Auth user created        │              │
   │            │◄─────────────┤              │              │
   │            │              │              │              │
   │            │ 4. POST /api/auth/signup    │              │
   │            ├─────────────────────────────►              │
   │            │              │              │              │
   │            │ 5. Tenant + User created    │              │
   │            │◄─────────────────────────────              │
   │            │              │              │              │
   │ 6. Show payment step      │              │              │
   │◄───────────┤              │              │              │
   │            │              │              │              │
   │ 7. Click "Start Trial"    │              │              │
   ├──────────►│               │              │              │
   │            │              │              │              │
   │            │ 8. POST /api/stripe/checkout│              │
   │            ├────────────────────────────►│              │
   │            │              │              │              │
   │            │ 9. Stripe session URL       │              │
   │            │◄────────────────────────────┤              │
   │            │              │              │              │
   │ 10. Redirect to Stripe    │              │              │
   │◄───────────┤              │              │              │
   │            │              │              │              │
   │ 11. Complete payment (Stripe)            │              │
   │────────────────────────────────────────────────────────►│
   │            │              │              │              │
   │            │              │              │ 12. Webhook  │
   │            │              │              │    event     │
   │            │              │              │◄─────────────┤
   │            │              │              │              │
   │            │              │              │ 13. Update   │
   │            │              │              │    tenant    │
   │            │              │              ├─────────────►│
   │            │              │              │              │
   │ 14. Redirect to /onboarding/business     │              │
   │◄────────────────────────────────────────────────────────┤
   │            │              │              │              │
```

### Chat API Flow

```
┌──────────┐     ┌─────────┐     ┌───────────────┐     ┌──────────┐
│  Widget  │     │Chat API │     │Tenant Resolver│     │ Database │
└────┬─────┘     └────┬────┘     └───────┬───────┘     └────┬─────┘
     │                │                  │                  │
     │ POST /api/chat │                  │                  │
     │ {tenantId: "symtri"}              │                  │
     ├───────────────►│                  │                  │
     │                │                  │                  │
     │                │ resolveTenantId("symtri")           │
     │                ├─────────────────►│                  │
     │                │                  │                  │
     │                │                  │ SELECT id FROM   │
     │                │                  │ tenants WHERE    │
     │                │                  │ slug = 'symtri'  │
     │                │                  ├─────────────────►│
     │                │                  │                  │
     │                │                  │ UUID returned    │
     │                │                  │◄─────────────────┤
     │                │                  │                  │
     │                │ UUID (cached)    │                  │
     │                │◄─────────────────┤                  │
     │                │                  │                  │
     │                │ Fetch knowledge chunks              │
     │                ├────────────────────────────────────►│
     │                │                  │                  │
     │                │ Generate AI response               │
     │                │◄────────────────────────────────────┤
     │                │                  │                  │
     │ Response       │                  │                  │
     │◄───────────────┤                  │                  │
     │                │                  │                  │
```

---

## Security Model

### Row Level Security (RLS)

All tables use RLS to ensure data isolation:

```sql
-- Tenants: Users can only access their linked tenant
CREATE POLICY "Tenants are viewable by linked users" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Users: Users can only access their own record
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- Subscriptions: Users can only access their tenant's subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Service role bypasses RLS for admin operations
CREATE POLICY "Service role can manage X" ON public.X
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### Authentication Flow Security

```
1. Password hashing: Handled by Supabase Auth (bcrypt)
2. Session tokens: JWT stored in HTTP-only cookies
3. CSRF protection: SameSite cookie attribute
4. Session refresh: Automatic via middleware
5. Magic links: Time-limited, single-use tokens
```

### API Security

| Endpoint | Auth Required | Rate Limited |
|----------|---------------|--------------|
| `/api/chat` | No (public widget) | Yes |
| `/api/auth/signup` | Partial (after Supabase signup) | Yes |
| `/api/stripe/*` | Yes (except webhook) | Yes |
| `/api/onboarding/*` | Yes | Yes |

---

## Multi-Tenant Design

### Product Access Model

```typescript
// Tenant products field
{
  "smartchat": true,   // Has SmartChat access
  "phonebot": false    // No PhoneBot access yet
}

// Check access
export async function checkProductAccess(
  tenantId: string,
  product: 'smartchat' | 'phonebot'
): Promise<boolean> {
  const { data } = await supabase
    .from('tenants')
    .select('products, status')
    .eq('id', tenantId)
    .single()

  if (!data) return false
  if (data.status === 'suspended' || data.status === 'cancelled') return false

  return data.products?.[product] === true
}
```

### Future Cross-Product Auth

For shared authentication across subdomains (smartchat.symtri.ai ↔ phonebot.symtri.ai):

```typescript
// Configure cookie domain for cross-subdomain sharing
createBrowserClient(url, key, {
  cookies: {
    domain: '.symtri.ai'  // Parent domain
  }
})
```

### Tenant Slug Strategy

Slugs are used in widget embed codes for cleaner URLs:

```html
<!-- Instead of UUID -->
<script src="https://smartchat.symtri.ai/widget.js"
        data-tenant="acme-corp-abc123"></script>

<!-- Resolved to UUID internally -->
resolveTenantId("acme-corp-abc123") → "c48decc4-98f5-4fe8-971f-5461d3e6ae1a"
```

---

## Performance Considerations

### Tenant Resolution Caching

- In-memory cache with 5-minute TTL
- Prevents database query on every chat message
- Cache invalidation: Not implemented (acceptable for slug changes)

### Database Indexes

```sql
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_stripe ON public.tenants(stripe_customer_id);
CREATE INDEX idx_users_auth ON public.users(auth_user_id);
CREATE INDEX idx_users_tenant ON public.users(tenant_id);
CREATE INDEX idx_subscriptions_tenant ON public.subscriptions(tenant_id);
```

### Session Handling

- Sessions refreshed on every request via middleware
- Prevents stale sessions in SSR context
- Cookie-based for cross-request persistence

---

## Extension Points

### Adding New Products

1. Add to `products` JSONB field in tenant
2. Create product-specific tables with `tenant_id` FK
3. Add RLS policies checking tenant access
4. Update `checkProductAccess()` function

### Adding Team Members

1. Create additional users with same `tenant_id`
2. Set appropriate `role` (admin, member)
3. RLS policies already support multi-user per tenant

### Adding OAuth Providers

1. Enable provider in Supabase Dashboard
2. Update `/auth/callback` to handle provider-specific flows
3. Link OAuth user to existing tenant if email matches

---

## Monitoring & Debugging

### Key Logs

| Source | What to Check |
|--------|---------------|
| Vercel Functions | API route errors |
| Supabase Logs | Auth failures, RLS violations |
| Stripe Dashboard | Webhook delivery, payment failures |

### Common Debug Queries

```sql
-- Check tenant status
SELECT id, slug, status, products, onboarding_completed_at
FROM tenants WHERE email = 'user@example.com';

-- Check user-tenant link
SELECT u.email, u.auth_user_id, u.tenant_id, t.slug
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'user@example.com';

-- Check subscription status
SELECT s.*, t.slug
FROM subscriptions s
JOIN tenants t ON s.tenant_id = t.id
WHERE t.slug = 'acme-corp';
```

---

## Contact

For technical questions about this implementation:

- **Architecture:** See this document
- **Implementation:** See ONBOARDING-IMPLEMENTATION-GUIDE.md
- **Support:** support@symtri.ai
