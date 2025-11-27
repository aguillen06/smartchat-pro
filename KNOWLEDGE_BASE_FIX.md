# Knowledge Base Fix

## Problem
The "Add Document" feature was failing with error: `Failed to create knowledge doc`

**Root Cause**: The `knowledge_docs` table was missing the `title` and `updated_at` columns that the API and dashboard were trying to use.

## Solution

### 1. Files Created/Modified

**NEW: `/app/api/knowledge/[id]/route.ts`**
- Added PUT endpoint for updating knowledge docs
- Added DELETE endpoint for deleting knowledge docs
- Both use admin Supabase client to bypass RLS

**MODIFIED: `/app/api/knowledge/route.ts`**
- Added debugging logs to show actual error details
- Already had POST and GET endpoints working

**NEW: `/supabase/migrations/20250126000001_add_title_to_knowledge_docs.sql`**
- Adds `title` column to knowledge_docs table
- Adds `updated_at` column with auto-update trigger

**NEW: `/fix_knowledge_base.sql`**
- Complete SQL script to run in Supabase
- Fixes schema and adds Symtri AI company info

### 2. How to Apply the Fix

**Option A: Run in Supabase SQL Editor (Recommended)**

1. Go to your Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `fix_knowledge_base.sql`
3. Click "Run"
4. Verify you see: "Schema updated successfully!"

**Option B: Apply Migration File**

1. If using Supabase CLI locally:
   ```bash
   supabase migration up
   ```

### 3. What the Fix Does

1. **Adds missing columns**:
   - `title TEXT` - For document titles
   - `updated_at TIMESTAMP` - Auto-updates when doc is modified

2. **Creates auto-update trigger**:
   - Automatically sets `updated_at = NOW()` on every update
   - No need to manually track update times

3. **Inserts Symtri AI company info**:
   - Automatically adds a complete knowledge doc about Symtri AI
   - Includes all products, pricing, contact info, location, etc.
   - AI can now answer questions about the company accurately

### 4. Testing the Fix

After running the SQL:

1. **Test Add Document**:
   - Go to http://localhost:3000/dashboard/knowledge
   - Click "+ Add Document"
   - Fill in title and content
   - Click "Add Document"
   - Should save successfully without error

2. **Test Edit Document**:
   - Click "Edit" on any document
   - Modify the content
   - Click "Update Document"
   - Should update successfully

3. **Test Delete Document**:
   - Click "Delete" on any document
   - Confirm deletion
   - Should remove successfully

4. **Test AI with Knowledge Base**:
   - Go to http://localhost:3000/demo
   - Ask: "What products does Symtri AI offer?"
   - AI should respond with SmartChat Pro, PhoneBot AI, LeadFlow AI, ProcessPilot
   - Ask: "Where is Symtri AI based?"
   - AI should respond: "South Texas"

## Database Schema (After Fix)

```sql
knowledge_docs (
  id UUID PRIMARY KEY,
  widget_id UUID REFERENCES widgets,
  content TEXT NOT NULL,
  source_url TEXT NULL,
  doc_type TEXT NULL,
  title TEXT,              -- NEWLY ADDED
  updated_at TIMESTAMP,    -- NEWLY ADDED
  created_at TIMESTAMP DEFAULT NOW()
)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge?widgetKey=xxx` | Get all knowledge docs for a widget |
| POST | `/api/knowledge` | Create a new knowledge doc (requires title, content, widgetKey) |
| PUT | `/api/knowledge/[id]` | Update an existing knowledge doc (requires title, content) |
| DELETE | `/api/knowledge/[id]` | Delete a knowledge doc |

## Next Steps

1. ✅ Run `fix_knowledge_base.sql` in Supabase SQL Editor
2. ✅ Test adding/editing/deleting documents in dashboard
3. ✅ Test AI responses about Symtri AI
4. ✅ Add more knowledge docs as needed

## Notes

- All API routes use `getSupabaseAdmin()` to bypass RLS
- The `updated_at` trigger automatically tracks modification times
- Knowledge docs are automatically included in AI responses via the chat API
- No changes needed to the chat widget - it already uses knowledge base
