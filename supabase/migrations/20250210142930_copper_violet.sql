-- Get all concerts ordered by date with venue and setlist info
SELECT 
  c.id,
  c.venue,
  c.city,
  c.state,
  c.country,
  c.date,
  c.tour_name,
  COUNT(s.id) as song_count
FROM concerts c
LEFT JOIN setlists s ON c.id = s.concert_id
GROUP BY c.id
ORDER BY c.date DESC
LIMIT 10;

-- Get total count of concerts
SELECT COUNT(*) as total_concerts FROM concerts;