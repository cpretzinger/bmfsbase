/*
  # Add Sample Concert Data

  1. Changes
    - Insert sample upcoming concerts
    - Insert sample past concerts
    - Add test data for development
*/

-- Insert sample upcoming concerts
INSERT INTO concerts (venue, city, state, country, date, notes)
VALUES
  ('Red Rocks Amphitheatre', 'Morrison', 'CO', 'USA', '2025-06-15', 'Two night run at Red Rocks'),
  ('Red Rocks Amphitheatre', 'Morrison', 'CO', 'USA', '2025-06-16', 'Night two of Red Rocks run'),
  ('The Gorge Amphitheatre', 'George', 'WA', 'USA', '2025-07-20', 'Summer tour opener'),
  ('Ryman Auditorium', 'Nashville', 'TN', 'USA', '2025-08-01', 'Historic venue debut'),
  ('Madison Square Garden', 'New York', 'NY', 'USA', '2025-09-15', 'Fall tour opener')
ON CONFLICT DO NOTHING;

-- Insert sample past concerts
INSERT INTO concerts (venue, city, state, country, date, notes)
VALUES
  ('The Capitol Theatre', 'Port Chester', 'NY', 'USA', '2024-12-31', 'New Years Eve celebration'),
  ('The Anthem', 'Washington', 'DC', 'USA', '2024-12-29', 'Pre-NYE show'),
  ('The Met Philadelphia', 'Philadelphia', 'PA', 'USA', '2024-12-28', 'Winter tour closer')
ON CONFLICT DO NOTHING;

-- Ensure public access is enabled for the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure sequences are accessible
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;