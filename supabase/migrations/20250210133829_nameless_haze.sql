/*
  # Update concerts schema for setlist data
  
  1. Changes
    - Add venue_name column to concerts table
    - Add venue_city column to concerts table
    - Add setlist_data column to concerts table
    - Add tour_name column to concerts table
    - Add source_id column to concerts table
    - Add last_updated column to concerts table

  2. Data Migration
    - Copy existing venue data to new columns
*/

-- Add new columns
ALTER TABLE concerts
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_city TEXT;

-- Copy existing data to new columns
UPDATE concerts
SET 
  venue_name = venue,
  venue_city = city
WHERE venue_name IS NULL;

-- Add setlist.fm specific columns
ALTER TABLE concerts
ADD COLUMN IF NOT EXISTS setlist_data JSONB,
ADD COLUMN IF NOT EXISTS tour_name TEXT,
ADD COLUMN IF NOT EXISTS source_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now();

-- Create index on source_id
CREATE INDEX IF NOT EXISTS concerts_source_id_idx ON concerts (source_id);