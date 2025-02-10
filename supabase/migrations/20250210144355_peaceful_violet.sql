/*
  # Fix Foreign Key Relationships

  1. Changes
    - Add foreign key constraint between comments and user_profiles
    - Add foreign key constraint between posts and comments
    - Update existing queries to use correct relationship names

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure the tables exist with proper structure
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Add explicit foreign key constraint for author_profile relationship
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS fk_author_profile;

ALTER TABLE comments
ADD CONSTRAINT fk_author_profile
FOREIGN KEY (author_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Add explicit foreign key constraint for post relationship
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS fk_author_profile;

ALTER TABLE posts
ADD CONSTRAINT fk_author_profile
FOREIGN KEY (author_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE;

-- Create indexes for the foreign keys if they don't exist
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON comments, posts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;