# Lead Capture Implementation

## What Was Added

### 1. Database Migration
**File:** `supabase/migrations/20250126000000_update_leads_table.sql`
- Made `name` and `email` fields nullable (some leads might only provide one contact method)
- Added `source` field to track how leads were captured ('chat_prompt', 'manual', etc.)

**To Apply:** Run `apply_lead_migration.sql` in your Supabase SQL Editor

### 2. Leads API
**File:** `app/api/leads/route.ts`
- **GET /api/leads?widgetKey=xxx** - Fetch all leads for a widget with conversation info
- **POST /api/leads** - Manually create a lead (for future admin features)
- Automatically updates `conversations.lead_captured` flag when lead is saved

### 3. Dashboard Leads Page
**File:** `app/dashboard/leads/page.tsx`
- Beautiful table view showing all captured leads
- Displays: Name, Email, Phone, Source, Captured Date
- Click to view the original conversation
- **Export to CSV** button for downloading leads
- Stats summary showing total leads, leads with email, leads with phone
- Empty state with friendly messaging when no leads exist

**Navigation:** Added "Leads" link to dashboard sidebar with 📧 icon

### 4. Smart Lead Capture Logic
**File:** `app/api/chat/route.ts` (updated)

**Automatic Prompting:**
- After 6 messages (3 user + 3 AI exchanges), if no lead captured yet
- AI naturally asks: "By the way, would you like me to email you more details? Just share your email and I'll send over some info!"
- Non-pushy, helpful tone that fits the conversation

**Automatic Detection:**
- Email regex: Detects valid email addresses in user messages
- Phone regex: Detects phone numbers in various formats (with/without +1, with/without dashes)
- When detected, automatically saves to leads table
- Updates conversation `lead_captured` flag to prevent duplicate prompts
- Works silently in background without interrupting conversation

### 5. Dashboard Overview
**Already Working:** The overview page already fetches real lead count and will automatically show the correct number once leads are captured.

## How It Works

### User Experience Flow:
1. User starts chatting with the widget
2. After 3 message exchanges, AI naturally asks for email
3. User provides email: "Sure! My email is john@example.com"
4. System automatically detects and saves the lead
5. Lead appears instantly in dashboard at `/dashboard/leads`
6. AI won't ask again for this conversation

### Detection Examples:
- ✅ "My email is john@example.com"
- ✅ "You can reach me at jane.doe@company.com"
- ✅ "Call me at 555-123-4567"
- ✅ "My number is (555) 123-4567"
- ✅ "Contact me: john@example.com or 555-123-4567"

## Testing the Feature

1. **Apply Database Migration:**
   - Go to Supabase Dashboard > SQL Editor
   - Run the contents of `apply_lead_migration.sql`

2. **Test Lead Capture:**
   - Open http://localhost:3000/demo
   - Chat with the widget for 3+ exchanges
   - Provide an email when prompted
   - Check `/dashboard/leads` to see the captured lead

3. **Export Leads:**
   - Go to `/dashboard/leads`
   - Click "Export to CSV"
   - Opens CSV with all lead data

## Dashboard Pages

| Page | URL | Description |
|------|-----|-------------|
| Overview | `/dashboard` | Stats including lead count |
| Conversations | `/dashboard/conversations` | All conversations |
| **Leads** | `/dashboard/leads` | **NEW: All captured leads** |
| Knowledge Base | `/dashboard/knowledge` | Manage AI knowledge |
| Settings | `/dashboard/settings` | Widget configuration |

## Database Schema

```sql
leads (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations,
  widget_id UUID REFERENCES widgets,
  name TEXT NULL,  -- Changed to nullable
  email TEXT NULL,  -- Changed to nullable
  phone TEXT NULL,
  source TEXT DEFAULT 'chat_prompt',  -- NEW FIELD
  message TEXT,
  is_contacted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Next Steps

1. Apply the database migration
2. Test the lead capture flow
3. Monitor leads in the dashboard
4. Optional: Add email notifications when leads are captured
5. Optional: Add lead scoring/prioritization features
