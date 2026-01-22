# SmartChat Customer Onboarding - Implementation Guide

> Step-by-step guide for setting up and using the unified customer onboarding system.

**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [User Flow](#user-flow)
6. [Testing the Flow](#testing-the-flow)
7. [Stripe Configuration](#stripe-configuration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The SmartChat onboarding system provides a unified authentication and signup experience for the Symtri AI ecosystem. It uses Supabase Auth for authentication and supports:

- Email/password authentication
- Password reset via magic links
- 14-day free trial with Stripe billing
- 4-step post-signup onboarding wizard
- Multi-tenant architecture for future products (PhoneBot, Automation Hub)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Supabase project with Auth enabled
- [ ] Stripe account with products/prices configured
- [ ] Vercel account for deployment
- [ ] Environment variables configured

### Required Stripe Products

| Plan | Price ID | Monthly Price |
|------|----------|---------------|
| Starter | `price_1Sj0bgLNymQzQ2SuoMYldDKh` | $297 |
| Professional | `price_1Sj0c7LNymQzQ2SuiTVptwPL` | $397 |

---

## Database Setup

### Step 1: Apply Migrations

Run the following migrations in order via Supabase Dashboard or MCP:

```sql
-- 1. Alter tenants table (add new columns)
-- See: supabase/migrations/004_unified_tenants.sql

-- 2. Link users to auth
-- See: supabase/migrations/005_link_users_auth.sql

-- 3. Add tenant to subscriptions
-- See: supabase/migrations/006_subscriptions_tenant.sql
```

### Step 2: Verify Tables

After migration, verify these columns exist:

**tenants table:**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `slug` (VARCHAR, UNIQUE)
- `business_name` (VARCHAR)
- `products` (JSONB) - `{"smartchat": false, "phonebot": false}`
- `status` (VARCHAR) - pending, trial, active, suspended, cancelled
- `onboarding_completed_at` (TIMESTAMPTZ)

**users table:**
- `auth_user_id` (UUID, FK to auth.users)
- `tenant_id` (UUID, FK to tenants)
- `role` (VARCHAR) - owner, admin, member
- `first_name`, `last_name` (VARCHAR)

**subscriptions table:**
- `tenant_id` (UUID, FK to tenants)
- `product` (VARCHAR) - smartchat, phonebot

### Step 3: Verify RLS Policies

Ensure Row Level Security is enabled on:
- `tenants` - Users can only access their linked tenant
- `users` - Users can only access their own record
- `subscriptions` - Users can only access their tenant's subscriptions

---

## Environment Configuration

### Required Environment Variables

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# App
NEXT_PUBLIC_APP_URL=https://smartchat.symtri.ai

# Email (optional)
RESEND_API_KEY=re_xxx
```

### Supabase Auth Settings

In Supabase Dashboard > Authentication > URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://smartchat.symtri.ai` |
| Redirect URLs | `https://smartchat.symtri.ai/auth/callback` |

---

## User Flow

### Signup Flow

```
1. User visits /signup
   ├── Selects plan (Starter or Professional)
   ├── Enters email, password, business name
   └── Clicks "Continue"

2. Account Creation
   ├── Supabase Auth user created
   ├── Tenant record created (status: pending)
   ├── User record created (linked to auth + tenant)
   └── User moves to Step 2

3. Payment Step
   ├── User clicks "Start Free Trial"
   ├── Redirected to Stripe Checkout
   └── 14-day trial starts

4. Stripe Webhook (checkout.session.completed)
   ├── Subscription created
   ├── Tenant status → "trial"
   ├── Tenant products.smartchat → true
   └── Welcome email sent

5. User redirected to /onboarding/business
```

### Onboarding Wizard

After payment, users complete 4 steps:

| Step | Route | Purpose |
|------|-------|---------|
| 1 | `/onboarding/business` | Business details (type, website, phone) |
| 2 | `/onboarding/knowledge` | Upload knowledge base content |
| 3 | `/onboarding/widget` | Configure widget appearance |
| 4 | `/onboarding/install` | Get embed code |

After Step 4, `tenant.onboarding_completed_at` is set and user is redirected to `/dashboard`.

### Login Flow

```
1. User visits /login
   ├── Enters email + password
   └── Clicks "Sign In"

2. Authentication
   ├── Supabase validates credentials
   ├── Session cookie set
   └── Middleware allows access

3. Dashboard Check
   ├── Fetch user + tenant data
   ├── If onboarding incomplete → /onboarding/business
   └── If complete → show dashboard
```

### Password Reset Flow

```
1. User clicks "Forgot password?" on /login
2. Enters email, clicks "Send Reset Link"
3. Receives email with magic link
4. Clicks link → /auth/callback?type=recovery
5. Redirected to /reset-password
6. Enters new password
7. Redirected to /dashboard
```

---

## Testing the Flow

### Test Signup (Development)

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/signup`
3. Select plan, enter test credentials
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete onboarding wizard

### Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Decline | `4000 0000 0000 0002` |
| Requires Auth | `4000 0025 0000 3155` |

### Webhook Testing (Local)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Note the webhook signing secret and add to .env.local
```

---

## Stripe Configuration

### Webhook Events

Configure these events in Stripe Dashboard > Webhooks:

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Create subscription, update tenant |
| `customer.subscription.updated` | Sync plan changes |
| `customer.subscription.deleted` | Handle cancellations |
| `invoice.payment_failed` | Handle failed payments |

### Checkout Session Settings

The checkout API creates sessions with:

```javascript
{
  mode: 'subscription',
  subscription_data: {
    trial_period_days: 14,
  },
  metadata: {
    tenant_id: 'uuid',
    product: 'smartchat',
  }
}
```

---

## Troubleshooting

### "Invalid tenant" error on chat API

**Cause:** Tenant slug not found in database.

**Solution:** Ensure tenant was created during signup and has a valid slug.

```sql
SELECT id, slug, status FROM tenants WHERE slug = 'your-slug';
```

### User redirected to login after signup

**Cause:** Session not established or RLS blocking access.

**Solution:**
1. Check browser cookies for Supabase session
2. Verify user record has `auth_user_id` set
3. Check RLS policies allow access

### Webhook not updating tenant

**Cause:** Webhook signature validation failing or tenant_id missing from metadata.

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Check webhook logs in Stripe Dashboard
3. Ensure `tenant_id` is in checkout session metadata

### Onboarding loop (keeps redirecting to /onboarding)

**Cause:** `onboarding_completed_at` not being set.

**Solution:**
1. Complete all 4 onboarding steps
2. Check `/api/onboarding/widget` is setting the timestamp
3. Verify with:

```sql
SELECT onboarding_completed_at FROM tenants WHERE id = 'your-tenant-id';
```

---

## Quick Reference

### Key Routes

| Route | Purpose |
|-------|---------|
| `/signup` | New customer signup |
| `/login` | Existing customer login |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password |
| `/auth/callback` | Handle auth redirects |
| `/onboarding/*` | 4-step setup wizard |
| `/dashboard` | Main analytics dashboard |

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Create tenant + user records |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe events |
| `/api/onboarding/knowledge` | POST | Save knowledge base |
| `/api/onboarding/widget` | POST | Save widget config |

---

## Support

For issues with the onboarding system:

- **Technical issues:** Check Supabase logs and Stripe webhook logs
- **Auth issues:** Verify environment variables and Supabase Auth settings
- **Billing issues:** Check Stripe Dashboard for payment/subscription status

Contact: support@symtri.ai
