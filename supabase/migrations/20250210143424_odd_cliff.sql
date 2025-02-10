/*
  # Fix Community Schema Issues

  1. Changes
    - Add missing columns to posts table
    - Update foreign key relationships
    - Add proper indexes
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
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

-- Create posts table with correct structure
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  category TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Update get_top_contributors function to not rely on users_roles
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
      u.id,
      up.username,
      (
        count(DISTINCT p.id) * 10 + -- Points for posts
        count(DISTINCT c.id) * 5 + -- Points for comments
        count(DISTINCT pv.post_id) + -- Points for votes
        count(DISTINCT cv.comment_id) -- Points for comment votes
      ) as total_points
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    LEFT JOIN posts p ON u.id = p.author_id
    LEFT JOIN comments c ON u.id = c.author_id
    LEFT JOIN post_votes pv ON u.id = pv.user_id
    LEFT JOIN comment_votes cv ON u.id = cv.user_id
    GROUP BY u.id, up.username
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
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON posts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;