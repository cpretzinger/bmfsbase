/*
  # Profile Enhancements

  1. New Tables
    - user_preferences: Store user preferences like theme, notifications, etc.
    - user_badges: Track user achievements and special badges
    - user_favorite_songs: Track user's favorite songs
    - user_favorite_venues: Track user's favorite venues

  2. Changes
    - Add new columns to user_profiles
    - Add new functions for profile customization
    - Add RLS policies for new tables

  3. Security
    - Enable RLS on all new tables
    - Add policies for user access
*/

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  show_attendance_public BOOLEAN DEFAULT true,
  show_stats_public BOOLEAN DEFAULT true,
  favorite_song_id UUID REFERENCES songs(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  badge_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_code)
);

-- User favorite songs table
CREATE TABLE IF NOT EXISTS user_favorite_songs (
  user_id UUID REFERENCES auth.users(id),
  song_id UUID REFERENCES songs(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  PRIMARY KEY (user_id, song_id)
);

-- User favorite venues table
CREATE TABLE IF NOT EXISTS user_favorite_venues (
  user_id UUID REFERENCES auth.users(id),
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  PRIMARY KEY (user_id, venue, city, country)
);

-- Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS first_show_date DATE,
ADD COLUMN IF NOT EXISTS favorite_tour TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB;

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_venues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorite songs"
  ON user_favorite_songs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorite venues"
  ON user_favorite_venues FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to get user's profile with preferences
CREATE OR REPLACE FUNCTION get_user_profile_extended(profile_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', up.id,
        'username', up.username,
        'bio', up.bio,
        'avatar_url', up.avatar_url,
        'location', up.location,
        'first_show_date', up.first_show_date,
        'favorite_tour', up.favorite_tour,
        'social_links', up.social_links,
        'created_at', up.created_at
      )
      FROM user_profiles up
      WHERE up.id = profile_id
    ),
    'preferences', (
      SELECT json_build_object(
        'theme', theme,
        'email_notifications', email_notifications,
        'show_attendance_public', show_attendance_public,
        'show_stats_public', show_stats_public
      )
      FROM user_preferences
      WHERE user_id = profile_id
    ),
    'badges', (
      SELECT json_agg(json_build_object(
        'badge_code', badge_code,
        'earned_at', earned_at
      ))
      FROM user_badges
      WHERE user_id = profile_id
    ),
    'favorite_songs', (
      SELECT json_agg(json_build_object(
        'song_id', s.id,
        'title', s.title,
        'added_at', ufs.added_at,
        'notes', ufs.notes
      ))
      FROM user_favorite_songs ufs
      JOIN songs s ON ufs.song_id = s.id
      WHERE ufs.user_id = profile_id
    ),
    'favorite_venues', (
      SELECT json_agg(json_build_object(
        'venue', venue,
        'city', city,
        'state', state,
        'country', country,
        'added_at', added_at,
        'notes', notes
      ))
      FROM user_favorite_venues
      WHERE user_id = profile_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  preferences JSON
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO user_preferences (
    user_id,
    theme,
    email_notifications,
    show_attendance_public,
    show_stats_public
  )
  VALUES (
    auth.uid(),
    preferences->>'theme',
    (preferences->>'email_notifications')::boolean,
    (preferences->>'show_attendance_public')::boolean,
    (preferences->>'show_stats_public')::boolean
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    theme = EXCLUDED.theme,
    email_notifications = EXCLUDED.email_notifications,
    show_attendance_public = EXCLUDED.show_attendance_public,
    show_stats_public = EXCLUDED.show_stats_public,
    updated_at = now()
  RETURNING json_build_object(
    'theme', theme,
    'email_notifications', email_notifications,
    'show_attendance_public', show_attendance_public,
    'show_stats_public', show_stats_public,
    'updated_at', updated_at
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_profile_extended TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences TO authenticated;