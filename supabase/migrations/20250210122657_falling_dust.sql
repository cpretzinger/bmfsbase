/*
  # Community Features Schema

  1. New Tables
    - posts
      - Core post data including title, content, and metadata
    - comments
      - Nested comments with parent_id for threading
    - post_votes and comment_votes
      - Track user votes on posts and comments
    - post_tags
      - Many-to-many relationship for post tags

  2. Functions
    - get_community_stats()
      - Returns current community statistics
    - get_top_contributors()
      - Calculates and returns top community contributors

  3. Security
    - RLS policies for all tables
    - Public read access
    - Authenticated write access
*/

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  category TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post votes table
CREATE TABLE IF NOT EXISTS post_votes (
  user_id UUID REFERENCES auth.users(id),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  vote SMALLINT CHECK (vote = 1 OR vote = -1),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Comment votes table
CREATE TABLE IF NOT EXISTS comment_votes (
  user_id UUID REFERENCES auth.users(id),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote SMALLINT CHECK (vote = 1 OR vote = -1),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Policies
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

CREATE POLICY "Public comments access"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can vote once per post"
  ON post_votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can vote once per comment"
  ON comment_votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_members', (SELECT count(*) FROM auth.users),
    'posts_today', (SELECT count(*) FROM posts WHERE created_at > current_date),
    'active_users', (SELECT count(DISTINCT author_id) FROM posts WHERE created_at > current_date - interval '1 hour')
  ) INTO result;
  
  RETURN result;
END;
$$;

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
      WHEN EXISTS (
        SELECT 1 FROM auth.users_roles ur 
        WHERE ur.user_id = up.id AND ur.role = 'moderator'
      ) THEN 'moderator'
      WHEN up.total_points >= 1000 THEN 'top-contributor'
      ELSE null
    END as badge
  FROM user_points up
  ORDER BY up.total_points DESC
  LIMIT limit_count;
END;
$$;

-- Triggers for updated_at
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

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();