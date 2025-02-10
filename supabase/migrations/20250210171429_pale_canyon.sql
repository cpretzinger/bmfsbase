-- Drop existing policies first
DROP POLICY IF EXISTS "Public read access for bingo_events" ON bingo_events;
DROP POLICY IF EXISTS "Users can create bingo_events" ON bingo_events;

-- Drop existing table if it exists
DROP TABLE IF EXISTS bingo_events CASCADE;

-- Create bingo_events table with proper structure
CREATE TABLE bingo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bingo_events ENABLE ROW LEVEL SECURITY;

-- Create policies using creator_id instead of user_id
CREATE POLICY "Public read access for bingo_events"
  ON bingo_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create bingo_events"
  ON bingo_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bingo_events_creator ON bingo_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_bingo_events_concert ON bingo_events(concert_id);

-- Grant permissions
GRANT SELECT ON bingo_events TO authenticated;
GRANT INSERT ON bingo_events TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;