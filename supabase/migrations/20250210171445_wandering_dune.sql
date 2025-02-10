-- Drop existing policies first
DROP POLICY IF EXISTS "Public concerts access" ON concerts;
DROP POLICY IF EXISTS "Public songs access" ON songs;
DROP POLICY IF EXISTS "Public setlists access" ON setlists;
DROP POLICY IF EXISTS "Service role can insert concerts" ON concerts;
DROP POLICY IF EXISTS "Service role can update concerts" ON concerts;

-- Update concerts table
ALTER TABLE concerts
ADD COLUMN IF NOT EXISTS source_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS setlist_data JSONB,
ADD COLUMN IF NOT EXISTS tour_name TEXT,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now();

-- Create indexes
CREATE INDEX IF NOT EXISTS concerts_source_id_idx ON concerts(source_id);
CREATE INDEX IF NOT EXISTS concerts_date_idx ON concerts(date);

-- Update setlists table to handle setlist.fm data
ALTER TABLE setlists
ADD COLUMN IF NOT EXISTS source_data JSONB,
ADD COLUMN IF NOT EXISTS encore_number INTEGER;

-- Enable RLS
ALTER TABLE concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public concerts access"
  ON concerts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public songs access"
  ON songs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public setlists access"
  ON setlists FOR SELECT
  TO public
  USING (true);

-- Create policies for service role to insert/update data
CREATE POLICY "Service role can insert concerts"
  ON concerts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update concerts"
  ON concerts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant additional permissions to the service role
GRANT ALL ON concerts TO service_role;
GRANT ALL ON songs TO service_role;
GRANT ALL ON setlists TO service_role;

-- Ensure sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;