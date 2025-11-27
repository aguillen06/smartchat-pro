-- Add title column to knowledge_docs table
ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS title TEXT;

-- Add updated_at column for tracking changes
ALTER TABLE knowledge_docs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_docs_updated_at
    BEFORE UPDATE ON knowledge_docs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
