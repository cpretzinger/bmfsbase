/*
  # Add Comments System Tables

  1. New Tables
    - `comments` - Stores post comments
    - `post_votes` - Stores post voting data
    - `comment_votes` - Stores comment voting data

  2. Changes
    - Add foreign key relationships
    - Add indexes for performance
    - Add triggers for vote counting
*/

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0
);

-- Create post votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_votes (
  user_id UUID REFERENCES auth.users(id),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  vote SMALLINT CHECK (vote = 1 OR vote = -1),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Create comment votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_votes (
  user_id UUID REFERENCES auth.users(id),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote SMALLINT CHECK (vote = 1 OR vote = -1),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment_id ON comment_votes(comment_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public comments access" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can vote once per post" ON post_votes;
DROP POLICY IF EXISTS "Users can vote once per comment" ON comment_votes;

-- Create RLS policies
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

-- Create trigger function for vote counting
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET
        upvotes = upvotes + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET
        upvotes = upvotes - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'comment_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE comments SET
        upvotes = upvotes + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE comments SET
        upvotes = upvotes - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END,
        downvotes = downvotes - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_post_vote_counts ON post_votes;
DROP TRIGGER IF EXISTS update_comment_vote_counts ON comment_votes;

-- Create triggers for vote counting
CREATE TRIGGER update_post_vote_counts
  AFTER INSERT OR DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

CREATE TRIGGER update_comment_vote_counts
  AFTER INSERT OR DELETE ON comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Create trigger for comment counting
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_post_comment_count ON comments;

CREATE TRIGGER update_post_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON comments, post_votes, comment_votes TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;