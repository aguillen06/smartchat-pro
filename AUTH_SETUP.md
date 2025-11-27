# Authentication Setup for SmartChat Pro

## Overview

SmartChat Pro now includes full authentication using Supabase Auth. Users can sign up, log in, and access their own dashboard with their widgets, conversations, leads, and knowledge base.

## What Was Added

### 1. Auth Pages (`/app/(auth)/`)
- **`/login`** - Email/password login with optional magic link
- **`/signup`** - User registration with email verification
- **`/forgot-password`** - Password reset flow

### 2. Auth Helpers (`/lib/auth.ts`)
- `signUp(email, password, fullName)` - Create new user
- `signIn(email, password)` - Email/password login
- `signInWithMagicLink(email)` - Passwordless login
- `signOut()` - Logout
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get current user
- `getSession()` - Get current session

### 3. Auth Context (`/contexts/AuthContext.tsx`)
- React context provider for user state
- `useAuth()` hook provides: `user`, `session`, `loading`, `signOut()`
- Automatically syncs auth state across app

### 4. Middleware (`/middleware.ts`)
- Protects `/dashboard/*` routes - redirects to `/login` if not authenticated
- Redirects `/login` and `/signup` to `/dashboard` if already logged in
- Uses Supabase SSR for edge-compatible auth checking

### 5. Dashboard Updates
- Shows logged-in user's email in header
- Logout button in header
- All dashboard pages now filtered by user's widgets (via RLS)

### 6. Database Schema Changes (`/supabase/migrations/20250126000002_add_auth_to_widgets.sql`)
- Added `owner_id` column to `widgets` table (references `auth.users`)
- Enabled Row Level Security (RLS) on all tables
- Created RLS policies to ensure users only see their own data
- Auto-trigger to set `owner_id` when creating widgets

## Setup Instructions

### Step 1: Enable Supabase Auth

1. Go to your **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Email** provider (already enabled by default)
3. **Optional**: Enable magic link by toggling "Enable email confirmations"

### Step 2: Configure Email Templates (Optional)

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email (for signups)
   - Magic link email
   - Password reset email

### Step 3: Run Database Migration

Run the auth migration in your **Supabase SQL Editor**:

```bash
# Copy and run the contents of:
supabase/migrations/20250126000002_add_auth_to_widgets.sql
```

This will:
- Add `owner_id` to widgets
- Enable RLS on all tables
- Create policies to protect user data

### Step 4: Link Demo Widget to Your Account

After creating your first user account, link the demo widget to your account:

1. **Sign up** at http://localhost:3000/signup
2. **Get your user ID** from Supabase Dashboard → Authentication → Users
3. **Run this SQL** in Supabase SQL Editor:

```sql
-- Replace YOUR_USER_ID with your actual user ID from Supabase
UPDATE widgets
SET owner_id = 'YOUR_USER_ID'
WHERE widget_key = 'demo_widget_key_123';
```

### Step 5: Test the Auth Flow

1. **Signup**: http://localhost:3000/signup
   - Create account with email/password
   - Check email for verification link (if enabled)

2. **Login**: http://localhost:3000/login
   - Sign in with credentials
   - Or use "Send magic link" option

3. **Dashboard**: http://localhost:3000/dashboard
   - Should redirect to login if not authenticated
   - Should show your email and logout button when logged in

4. **Logout**: Click "Logout" button in dashboard header

## How It Works

### Row Level Security (RLS)

All data is now protected by RLS policies:

**Widgets Table**:
- Users can only see/edit widgets where `owner_id = auth.uid()`

**Conversations Table**:
- Users can only see conversations for their own widgets

**Messages Table**:
- Users can only see messages for their conversations

**Leads Table**:
- Users can only see leads captured from their widgets

**Knowledge Docs Table**:
- Users can manage knowledge docs for their own widgets

### Auth Flow

```
1. User visits /dashboard
   ↓
2. Middleware checks for valid session
   ↓
3. No session? → Redirect to /login
   ↓
4. User logs in
   ↓
5. Session created, cookies set
   ↓
6. Redirect to /dashboard
   ↓
7. Dashboard queries only show user's data (via RLS)
```

### Magic Link Flow

```
1. User enters email at /login
   ↓
2. Check "Use magic link" option
   ↓
3. Click "Send magic link"
   ↓
4. Email sent with secure link
   ↓
5. User clicks link in email
   ↓
6. Auto-login and redirect to /dashboard
```

## API Routes & Auth

### Public Routes (No Auth Required)
- `/api/chat` - Chat widget API (uses `widgetKey`, not auth)
- `/api/widgets/[key]` - Widget config lookup

### Protected Routes (Require Auth via RLS)
- `/api/leads` - Uses admin client but filters by widget ownership
- `/api/knowledge` - Protected by RLS policies
- All dashboard pages

### Important: Chat Widget Stays Public

The chat widget (`/api/chat`) remains **publicly accessible** because:
- It's embedded on client websites
- Visitors don't have Supabase accounts
- Security is via `widgetKey`, not user auth

RLS policies ensure that even though the API uses an admin client, the dashboard only shows data for widgets the user owns.

## Creating Additional Users

### For Team Members:

1. Each team member signs up at `/signup`
2. Admin creates a new widget for them:
   ```sql
   INSERT INTO widgets (widget_key, owner_id, is_active)
   VALUES ('team_member_widget_key', 'THEIR_USER_ID', true);
   ```

### For Clients (Multi-tenant):

1. Client signs up and verifies email
2. System auto-creates widget with their `owner_id`
3. They only see their own conversations/leads

## Troubleshooting

### "Widget not found" after migration
- You need to link widgets to users via `owner_id`
- Run the UPDATE SQL in Step 4 above

### Can't access dashboard after login
- Check browser cookies are enabled
- Check Supabase URL and keys in `.env`
- Check middleware logs for errors

### Email not sending
- Check Supabase → Settings → Auth → SMTP settings
- Or use Supabase's default email service

### RLS blocking API routes
- API routes using `getSupabaseAdmin()` bypass RLS
- Regular `supabase` client respects RLS
- Make sure protected routes use admin client

## Security Best Practices

✅ **Do**:
- Always use HTTPS in production
- Enable email verification for signups
- Use strong password requirements
- Regularly audit user access

❌ **Don't**:
- Share service role keys publicly
- Disable RLS on tables with user data
- Use admin client for client-side code

## Next Steps

1. ✅ Enable email verification in Supabase
2. ✅ Customize email templates with your branding
3. ✅ Add user profile page
4. ✅ Add multi-widget support (let users create multiple widgets)
5. ✅ Add team/organization features
6. ✅ Add billing/subscription (Stripe integration)

## Files Modified

### New Files:
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `lib/auth.ts`
- `contexts/AuthContext.tsx`
- `middleware.ts`
- `supabase/migrations/20250126000002_add_auth_to_widgets.sql`

### Modified Files:
- `app/layout.tsx` - Added AuthProvider
- `app/dashboard/layout.tsx` - Added user email and logout button
- `package.json` - Added @supabase/ssr dependency

## Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs/guides/auth
2. Review migration SQL for RLS policies
3. Check browser console for auth errors
4. Verify environment variables are set correctly
