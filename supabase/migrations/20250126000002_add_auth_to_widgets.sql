-- Add owner_id column to widgets table to link widgets to authenticated users
ALTER TABLE widgets ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups by owner_id
CREATE INDEX IF NOT EXISTS idx_widgets_owner_id ON widgets(owner_id);

-- Update existing widgets to have a demo owner (optional - for development)
-- You can set this to a specific user ID after creating your first user
-- UPDATE widgets SET owner_id = 'YOUR_USER_ID_HERE' WHERE owner_id IS NULL;

-- Enable RLS on widgets table
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own widgets
CREATE POLICY "Users can view their own widgets"
  ON widgets
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Create policy: Users can insert their own widgets
CREATE POLICY "Users can create their own widgets"
  ON widgets
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Create policy: Users can update their own widgets
CREATE POLICY "Users can update their own widgets"
  ON widgets
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Create policy: Users can delete their own widgets
CREATE POLICY "Users can delete their own widgets"
  ON widgets
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Enable RLS on related tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see conversations for their widgets
CREATE POLICY "Users can view conversations for their widgets"
  ON conversations
  FOR SELECT
  USING (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

-- Messages: Users can only see messages for their conversations
CREATE POLICY "Users can view messages for their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN widgets w ON c.widget_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- Leads: Users can only see leads for their widgets
CREATE POLICY "Users can view leads for their widgets"
  ON leads
  FOR SELECT
  USING (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

-- Knowledge docs: Users can manage knowledge docs for their widgets
CREATE POLICY "Users can view knowledge docs for their widgets"
  ON knowledge_docs
  FOR SELECT
  USING (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create knowledge docs for their widgets"
  ON knowledge_docs
  FOR INSERT
  WITH CHECK (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update knowledge docs for their widgets"
  ON knowledge_docs
  FOR UPDATE
  USING (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete knowledge docs for their widgets"
  ON knowledge_docs
  FOR DELETE
  USING (
    widget_id IN (
      SELECT id FROM widgets WHERE owner_id = auth.uid()
    )
  );

-- Create a function to automatically set owner_id when creating a widget
CREATE OR REPLACE FUNCTION set_widget_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set owner_id
DROP TRIGGER IF EXISTS set_widget_owner_trigger ON widgets;
CREATE TRIGGER set_widget_owner_trigger
  BEFORE INSERT ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION set_widget_owner();
