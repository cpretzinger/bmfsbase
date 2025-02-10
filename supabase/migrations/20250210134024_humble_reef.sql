/*
  # Update Schema for Setlist.fm Data Import
  
  1. Changes
    - Add missing columns needed for setlist.fm data
    - Update constraints to handle setlist.fm data format
    - Add indexes for better query performance
*/

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