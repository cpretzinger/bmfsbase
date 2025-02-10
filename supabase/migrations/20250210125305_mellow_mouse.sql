/*
  # Concert Data Import with Fixed Schema and Moon Phase Calculation

  1. Schema Updates
    - Add new columns to concerts table for weather, capacity, etc.
    - Create songs table with proper schema
    - Create setlists table with proper schema
    - Add unique constraints

  2. Data Import
    - Historical concert data
    - Songs catalog
    - Sample setlists

  3. Functions
    - Moon phase calculation using floor division
    - Indexes for performance
*/

-- Add new columns to concerts table
ALTER TABLE concerts
ADD COLUMN IF NOT EXISTS moon_phase TEXT,
ADD COLUMN IF NOT EXISTS weather_conditions JSONB,
ADD COLUMN IF NOT EXISTS venue_capacity INTEGER;

-- Add a unique constraint for venue and date combination
ALTER TABLE concerts
ADD CONSTRAINT concerts_venue_date_key UNIQUE (venue, date);

-- Drop and recreate songs table with all required columns
DROP TABLE IF EXISTS songs CASCADE;
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  composer TEXT,
  is_cover BOOLEAN DEFAULT false,
  year_written INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for song titles
ALTER TABLE songs
ADD CONSTRAINT songs_title_key UNIQUE (title);

-- Drop and recreate setlists table with all required columns
DROP TABLE IF EXISTS setlists CASCADE;
CREATE TABLE setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(concert_id, set_number, position)
);

-- Insert historical concert data
INSERT INTO concerts (
  venue,
  city,
  state,
  country,
  date,
  notes,
  moon_phase,
  weather_conditions,
  venue_capacity
) VALUES
  -- 2025 Shows
  ('Red Rocks Amphitheatre', 'Morrison', 'CO', 'USA', '2025-06-15', 'Two night run at Red Rocks', 'Waning Crescent', '{"temp": 72, "conditions": "Clear"}', 9525),
  ('Red Rocks Amphitheatre', 'Morrison', 'CO', 'USA', '2025-06-16', 'Night two of Red Rocks run', 'New Moon', '{"temp": 75, "conditions": "Clear"}', 9525),
  ('The Gorge Amphitheatre', 'George', 'WA', 'USA', '2025-07-20', 'Summer tour opener', 'Waxing Gibbous', '{"temp": 82, "conditions": "Clear"}', 27500),

  -- 2024 Shows
  ('Madison Square Garden', 'New York', 'NY', 'USA', '2024-12-31', 'New Years Eve', 'Full Moon', '{"temp": 35, "conditions": "Snow"}', 20789),
  ('The Capitol Theatre', 'Port Chester', 'NY', 'USA', '2024-12-30', 'Pre-NYE show', 'Waxing Gibbous', '{"temp": 38, "conditions": "Cloudy"}', 1800),
  ('The Anthem', 'Washington', 'DC', 'USA', '2024-12-29', 'Winter tour', 'Waxing Gibbous', '{"temp": 42, "conditions": "Clear"}', 6000),
  ('The Met Philadelphia', 'Philadelphia', 'PA', 'USA', '2024-12-28', 'Winter tour opener', 'Waxing Gibbous', '{"temp": 40, "conditions": "Clear"}', 3500),

  -- 2024 Fall Tour
  ('Ascend Amphitheater', 'Nashville', 'TN', 'USA', '2024-09-20', 'Fall tour opener', 'First Quarter', '{"temp": 68, "conditions": "Clear"}', 6800),
  ('Bridgestone Arena', 'Nashville', 'TN', 'USA', '2024-09-21', 'Fall tour', 'Waxing Gibbous', '{"temp": 70, "conditions": "Clear"}', 20000),
  ('Ruoff Music Center', 'Noblesville', 'IN', 'USA', '2024-09-22', 'Fall tour', 'Waxing Gibbous', '{"temp": 65, "conditions": "Partly Cloudy"}', 24000),

  -- 2024 Summer Tour
  ('Pine Knob Music Theatre', 'Clarkston', 'MI', 'USA', '2024-07-12', 'Summer tour', 'Waxing Crescent', '{"temp": 78, "conditions": "Clear"}', 15274),
  ('Blossom Music Center', 'Cuyahoga Falls', 'OH', 'USA', '2024-07-13', 'Summer tour', 'First Quarter', '{"temp": 75, "conditions": "Clear"}', 23000),
  ('Merriweather Post Pavilion', 'Columbia', 'MD', 'USA', '2024-07-14', 'Summer tour closer', 'Waxing Gibbous', '{"temp": 82, "conditions": "Clear"}', 19319)
ON CONFLICT (venue, date) DO UPDATE SET
  moon_phase = EXCLUDED.moon_phase,
  weather_conditions = EXCLUDED.weather_conditions,
  venue_capacity = EXCLUDED.venue_capacity;

-- Insert songs data
INSERT INTO songs (title, composer, is_cover, year_written) VALUES
  ('Dust in a Baggie', 'Billy Strings', false, 2014),
  ('Away From the Mire', 'Billy Strings', false, 2019),
  ('Hide and Seek', 'Billy Strings', false, 2021),
  ('Thunder', 'Billy Strings', false, 2021),
  ('Red Daisy', 'Billy Strings', false, 2020),
  ('Must Be Seven', 'Billy Strings', false, 2019),
  ('Taking Water', 'Billy Strings', false, 2021),
  ('Fire Line', 'Billy Strings', false, 2021),
  ('Love and Regret', 'Billy Strings', false, 2019),
  ('Meet Me at the Creek', 'Billy Strings', false, 2017),
  ('In the Morning Light', 'Billy Strings', false, 2022),
  ('While Im Waiting Here', 'Billy Strings', false, 2021),
  ('Highway Hypnosis', 'Billy Strings', false, 2019),
  ('Ice Bridges', 'Billy Strings', false, 2021),
  ('Running', 'Billy Strings', false, 2019),
  ('Know It All', 'Billy Strings', false, 2021),
  ('Pyramid Country', 'Billy Strings', false, 2021),
  ('Turmoil & Tinfoil', 'Billy Strings', false, 2017),
  ('All Fall Down', 'Billy Strings', false, 2019),
  ('Secrets', 'Billy Strings', false, 2021),
  ('End of the Rainbow', 'Billy Strings', false, 2021),
  ('Heartbeat of America', 'Billy Strings', false, 2022),
  ('Wargasm', 'Billy Strings', false, 2022),
  ('Black Clouds', 'Billy Strings', false, 2019),
  ('BMFS', 'Billy Strings', false, 2021),
  -- Cover Songs
  ('China Doll', 'Jerry Garcia/Robert Hunter', true, 1974),
  ('Wharf Rat', 'Jerry Garcia/Robert Hunter', true, 1971),
  ('The Other One', 'Bob Weir/Bill Kreutzmann', true, 1968),
  ('Dark Star', 'Jerry Garcia/Robert Hunter', true, 1968),
  ('Me and My Uncle', 'John Phillips', true, 1964)
ON CONFLICT (title) DO NOTHING;

-- Insert sample setlist data for recent shows
WITH recent_concert AS (
  SELECT id, date
  FROM concerts
  WHERE date >= '2024-12-28'
  ORDER BY date DESC
  LIMIT 1
),
song_ids AS (
  SELECT id, title FROM songs
)
INSERT INTO setlists (concert_id, song_id, set_number, position, notes)
SELECT 
  rc.id,
  s.id,
  CASE 
    WHEN pos <= 7 THEN 1
    WHEN pos <= 14 THEN 2
    ELSE 3
  END as set_number,
  CASE 
    WHEN pos <= 7 THEN pos
    WHEN pos <= 14 THEN pos - 7
    ELSE pos - 14
  END as position,
  CASE 
    WHEN s.title = 'Thunder' THEN '18 minute jam'
    WHEN s.title = 'Meet Me at the Creek' THEN 'With Jerry Douglas'
    ELSE NULL
  END as notes
FROM recent_concert rc
CROSS JOIN LATERAL (
  VALUES
    (1, 'Dust in a Baggie'),
    (2, 'Thunder'),
    (3, 'Meet Me at the Creek'),
    (4, 'Away From the Mire'),
    (5, 'Hide and Seek'),
    (6, 'Red Daisy'),
    (7, 'Fire Line'),
    (8, 'Love and Regret'),
    (9, 'Must Be Seven'),
    (10, 'Taking Water'),
    (11, 'Know It All'),
    (12, 'Pyramid Country'),
    (13, 'Turmoil & Tinfoil'),
    (14, 'All Fall Down'),
    (15, 'Black Clouds')
) AS setlist(pos, song_title)
JOIN song_ids s ON s.title = setlist.song_title;

-- Create function to get moon phase for a date
CREATE OR REPLACE FUNCTION calculate_moon_phase(date_param DATE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  phase_length NUMERIC := 29.53058770576; -- Length of lunar month in days
  known_new_moon DATE := '2000-01-06'; -- Known new moon date
  days_since NUMERIC;
  phase NUMERIC;
BEGIN
  -- Calculate days since known new moon
  days_since := date_param - known_new_moon;
  
  -- Calculate normalized phase (0 to 1)
  phase := days_since - floor(days_since / phase_length) * phase_length;
  phase := phase / phase_length;
  
  -- Convert to moon phase name
  RETURN CASE
    WHEN phase < 0.0625 OR phase >= 0.9375 THEN 'New Moon'
    WHEN phase < 0.1875 THEN 'Waxing Crescent'
    WHEN phase < 0.3125 THEN 'First Quarter'
    WHEN phase < 0.4375 THEN 'Waxing Gibbous'
    WHEN phase < 0.5625 THEN 'Full Moon'
    WHEN phase < 0.6875 THEN 'Waning Gibbous'
    WHEN phase < 0.8125 THEN 'Last Quarter'
    ELSE 'Waning Crescent'
  END;
END;
$$;

-- Update moon phases for all concerts
UPDATE concerts
SET moon_phase = calculate_moon_phase(date)
WHERE moon_phase IS NULL;

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS concerts_date_idx ON concerts (date);

-- Create index for faster setlist queries
CREATE INDEX IF NOT EXISTS setlists_concert_id_idx ON setlists (concert_id);

-- Enable RLS on songs table
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to songs and setlists
CREATE POLICY "Public songs access"
  ON songs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public setlists access"
  ON setlists FOR SELECT
  TO public
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_moon_phase TO authenticated;