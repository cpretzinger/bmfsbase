-- Add policy for inserting concerts
CREATE POLICY "Service role can insert concerts"
  ON concerts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add policy for updating concerts
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