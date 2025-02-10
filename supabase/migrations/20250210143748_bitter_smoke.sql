/*
  # Fix Posts and User Profiles Relationship

  1. Changes
    - Drop and recreate posts table with proper foreign key relationship
    - Add foreign key constraint to link posts with user_profiles
    - Update RLS policies
    - Add necessary indexes

  2. Security
    - Maintain existing RLS policies
    - Ensure proper permissions
*/

-- First ensure user_profiles exists and has proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drop existing posts table if it exists
DROP TABLE IF EXISTS posts CASCADE;

-- Recreate posts table with proper foreign key relationship
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  category TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  CONSTRAINT fk_author_profile 
    FOREIGN KEY (author_id) 
    REFERENCES user_profiles(id) 
    ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Public posts access"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::uuid = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid()::uuid = author_id);

-- Update get_top_contributors function
CREATE OR REPLACE FUNCTION get_top_contributors(limit_count integer DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  username text,
  points bigint,
  badge text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT 
      up.id,
      up.username,
      (
        count(DISTINCT p.id) * 10 + -- Points for posts
        count(DISTINCT c.id) * 5 + -- Points for comments
        count(DISTINCT pv.post_id) + -- Points for votes
        count(DISTINCT cv.comment_id) -- Points for comment votes
      ) as total_points
    FROM user_profiles up
    LEFT JOIN posts p ON up.id = p.author_id
    LEFT JOIN comments c ON up.id = c.author_id
    LEFT JOIN post_votes pv ON up.id = pv.user_id
    LEFT JOIN comment_votes cv ON up.id = cv.user_id
    GROUP BY up.id, up.username
  )
  SELECT 
    up.id,
    up.username,
    up.total_points,
    CASE 
      WHEN up.total_points >= 1000 THEN 'top-contributor'
      ELSE null
    END as badge
  FROM user_points up
  ORDER BY up.total_points DESC
  LIMIT limit_count;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON posts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;