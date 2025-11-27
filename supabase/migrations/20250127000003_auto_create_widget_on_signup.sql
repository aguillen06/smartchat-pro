-- Auto-create a widget for new users
-- This trigger runs when a new user signs up via Supabase Auth

-- Function to create a default widget for new users
CREATE OR REPLACE FUNCTION create_widget_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  widget_key TEXT;
  customer_id_val UUID;
BEGIN
  -- Generate a unique widget key
  widget_key := 'widget_' || substring(md5(random()::text) from 1 for 16);

  -- Get or create a customer record for this user
  -- For now, we'll create a basic customer record
  INSERT INTO customers (email, business_name, created_at)
  VALUES (NEW.email, 'Personal Account', NOW())
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO customer_id_val;

  -- Create a default widget for the new user
  INSERT INTO widgets (
    customer_id,
    owner_id,
    widget_key,
    welcome_message,
    ai_instructions,
    primary_color,
    is_active
  ) VALUES (
    customer_id_val,
    NEW.id,
    widget_key,
    'Hi! How can I help you today?',
    'You are a helpful AI assistant. Be friendly, concise, and helpful. Answer questions clearly and provide useful information.',
    '#3B82F6',
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that runs after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_widget_for_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
