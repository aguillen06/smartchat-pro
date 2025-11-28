# Stripe Billing Setup Instructions

## Issues Found and Fixed

1. ✅ **Fixed:** `NEXT_PUBLIC_APP_URL` was using port 3000 instead of 3002
2. ✅ **Fixed:** Added debugging logs to checkout API
3. ✅ **Fixed:** Configured webhook to work without signature in development
4. ❌ **CRITICAL:** The `subscriptions` table doesn't exist in your database

## Required Setup Steps

### 1. Run Database Migration (REQUIRED)

The subscriptions and usage_tracking tables are missing from your database. You need to run the migration:

1. Go to your Supabase Dashboard: https://rxiyvhucpzrmcnaqolwu.supabase.co
2. Navigate to the SQL Editor
3. Open the file `/supabase/migrations/20250127000004_add_subscriptions_table.sql`
4. Copy ALL the SQL content and paste it in the SQL Editor
5. Click "Run" to execute the migration

This will create:
- `subscriptions` table
- `usage_tracking` table
- Required database functions
- Row Level Security policies

### 2. Test Database Setup

After running the migration, test that tables were created:

```bash
curl http://localhost:3002/api/test-db | jq
```

You should see:
```json
{
  "hasSubscriptionsTable": true,
  "hasUsageTrackingTable": true,
  ...
}
```

### 3. Configure Stripe Webhooks (For Testing)

#### Option A: Use Stripe CLI (Recommended for Local Testing)

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

4. Copy the webhook signing secret shown (starts with `whsec_`)
5. Update `.env` with the webhook secret:
```
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

#### Option B: Use ngrok (For Testing with Real Webhooks)

1. Install ngrok:
```bash
brew install ngrok
```

2. Start ngrok tunnel:
```bash
ngrok http 3002
```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. In Stripe Dashboard:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Enter URL: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"

5. Copy the signing secret and update `.env`

### 4. Test Checkout Flow

1. Go to http://localhost:3002/dashboard/billing
2. Click "Upgrade to Starter" or "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code
4. Complete the checkout
5. You should be redirected back to the billing page
6. Check console logs for debugging info

## Debugging Tips

### Check API Logs
Watch the terminal running `npm run dev` for:
- "Checkout request:" - Shows plan selection
- "Using price ID:" - Shows the Stripe price being used
- "Creating checkout session with:" - Shows success/cancel URLs
- "Checkout session created:" - Shows session ID and URL

### Check Webhook Logs
If using Stripe CLI, you'll see:
- "📥 Webhook received:" - Shows incoming webhook events
- Event processing logs

### Common Issues

1. **"Site can't be reached" after checkout:**
   - Make sure `NEXT_PUBLIC_APP_URL` is `http://localhost:3002`
   - Restart the dev server after changing .env

2. **No payment in Stripe Dashboard:**
   - Check if you're in Test mode in Stripe Dashboard
   - Verify you're using test API keys (start with `sk_test_` and `pk_test_`)

3. **Billing page still shows Free Trial:**
   - Check if webhook is receiving events (use Stripe CLI)
   - Check if subscriptions table exists (run migration)
   - Check console for database errors

4. **Database errors:**
   - Run the migration in Supabase Dashboard
   - Check that all tables were created successfully

## Current Status

✅ Code is ready and configured correctly
✅ Debugging logs are in place
❌ Database migration needs to be run
⏳ Webhooks need to be configured (optional for testing)

Once you run the database migration, the checkout flow should work correctly!