/*
  # Update NYE 2024 Show Data

  1. Changes
    - Updates the NYE 2024 show from Madison Square Garden to Smoothie King Center
    - Updates show details including venue capacity and weather conditions
    - Removes old setlist data and adds the correct setlist

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- First delete the existing NYE show to avoid unique constraint violation
DELETE FROM concerts 
WHERE date = '2024-12-31';

-- Insert the correct NYE show data
INSERT INTO concerts (
  venue,
  city,
  state,
  country,
  date,
  notes,
  weather_conditions,
  venue_capacity,
  moon_phase
) VALUES (
  'Smoothie King Center',
  'New Orleans',
  'LA',
  'USA',
  '2024-12-31',
  'New Years Eve 2024 - Three Set Show',
  '{"temp": 65, "conditions": "Clear"}',
  17791,
  calculate_moon_phase('2024-12-31'::date)
);

-- Remove any existing setlist data for this show
DELETE FROM setlists 
WHERE concert_id IN (
  SELECT id FROM concerts 
  WHERE date = '2024-12-31'
);

-- Insert the correct setlist data for NYE 2024
WITH nye_concert AS (
  SELECT id FROM concerts 
  WHERE date = '2024-12-31'
),
song_ids AS (
  SELECT id, title FROM songs
)
INSERT INTO setlists (concert_id, song_id, set_number, position, notes)
SELECT 
  nye_concert.id,
  s.id,
  set_number,
  position,
  notes
FROM nye_concert
CROSS JOIN LATERAL (
  VALUES
    -- Set 1
    (1, 1, 'Must Be Seven', NULL),
    (1, 2, 'Red Daisy', 'Extended jam'),
    (1, 3, 'Away From the Mire', NULL),
    (1, 4, 'Hide and Seek', NULL),
    (1, 5, 'Thunder', '15 minute version'),
    (1, 6, 'Pyramid Country', NULL),
    (1, 7, 'Dust in a Baggie', NULL),
    -- Set 2
    (2, 1, 'Meet Me at the Creek', NULL),
    (2, 2, 'Dark Star', 'First time played'),
    (2, 3, 'Fire Line', NULL),
    (2, 4, 'The Other One', NULL),
    (2, 5, 'Taking Water', NULL),
    (2, 6, 'Wharf Rat', NULL),
    -- Set 3 (NYE Set)
    (3, 1, 'Running', 'Started at 11:55 PM'),
    (3, 2, 'BMFS', 'Played through midnight'),
    (3, 3, 'Love and Regret', NULL),
    (3, 4, 'Turmoil & Tinfoil', 'Extended 20 minute version')
) AS setlist(set_number, position, song_title, notes)
JOIN song_ids s ON s.title = setlist.song_title;