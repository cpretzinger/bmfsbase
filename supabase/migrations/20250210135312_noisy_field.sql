/*
  # Add RLS policies for concert data insertion

  1. Changes
    - Add policy to allow inserting concert data
    - Add policy to allow upserting songs
    - Add policy to allow creating setlist entries
    - Add policy to allow updating concert data

  2. Security
    - Policies are scoped to authenticated users
    - Maintains existing read-only public access
*/

-- Add policy for inserting concerts
CREATE POLICY "Allow insert concerts"
  ON concerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for updating concerts
CREATE POLICY "Allow update concerts"
  ON concerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add policy for inserting songs
CREATE POLICY "Allow insert songs"
  ON songs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for updating songs
CREATE POLICY "Allow update songs"
  ON songs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add policy for inserting setlists
CREATE POLICY "Allow insert setlists"
  ON setlists FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy for updating setlists
CREATE POLICY "Allow update setlists"
  ON setlists FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);