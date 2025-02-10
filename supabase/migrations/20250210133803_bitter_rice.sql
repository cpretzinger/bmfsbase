/*
  # Add setlist data columns
  
  1. Changes
    - Add event_date column to concerts table
    - Add venue_name column to concerts table 
    - Add venue_coords column to concerts table
    - Add setlist_data column to concerts table
    - Add tour_name column to concerts table
    - Add source_id column to concerts table
    - Add last_updated column to concerts table

  2. Indexes
    - Add index on source_id for faster lookups
*/

-- Add new columns to concerts table
ALTER TABLE concerts
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS venue_coords JSONB,
ADD COLUMN IF NOT EXISTS setlist_data JSONB,
ADD COLUMN IF NOT EXISTS tour_name TEXT,
ADD COLUMN IF NOT EXISTS source_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ;

-- Create index on source_id
CREATE INDEX IF NOT EXISTS concerts_source_id_idx ON concerts (source_id);

-- Update existing concerts to use event_date
UPDATE concerts 
SET event_date = date 
WHERE event_date IS NULL;