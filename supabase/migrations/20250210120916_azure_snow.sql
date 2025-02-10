/*
  # Fix Verified Attendance Table Structure

  1. Changes
    - Add missing concert_id column to verified_attendance table
    - Ensure foreign key constraint is in place
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add concert_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'verified_attendance' 
    AND column_name = 'concert_id'
  ) THEN
    ALTER TABLE verified_attendance 
    ADD COLUMN concert_id UUID REFERENCES concerts(id);
  END IF;
END $$;