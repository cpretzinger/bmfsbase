/*
  # Add Vote and Comment Count Tracking
  
  1. Changes
    - Add vote and comment count columns to posts table
    - Create functions to update counts
    - Add triggers to maintain counts automatically
  
  2. Security
    - Functions run with security definer to ensure proper access
    - Maintains existing RLS policies
*/

-- Add count columns to posts
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote = 1 THEN
      UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote = 1 THEN
      UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote = 1 AND NEW.vote = -1 THEN
      UPDATE posts 
      SET upvotes = upvotes - 1,
          downvotes = downvotes + 1
      WHERE id = NEW.post_id;
    ELSIF OLD.vote = -1 AND NEW.vote = 1 THEN
      UPDATE posts 
      SET upvotes = upvotes + 1,
          downvotes = downvotes - 1
      WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for vote counts
DROP TRIGGER IF EXISTS update_post_vote_counts_trigger ON post_votes;
CREATE TRIGGER update_post_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON post_votes
FOR EACH ROW
EXECUTE FUNCTION update_post_vote_counts();

-- Trigger for comment counts
DROP TRIGGER IF EXISTS update_post_comment_count_trigger ON comments;
CREATE TRIGGER update_post_comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_count();

-- Function to recalculate all counts (for maintenance)
CREATE OR REPLACE FUNCTION recalculate_post_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update vote counts
  UPDATE posts p SET
    upvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = p.id AND vote = 1
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM post_votes 
      WHERE post_id = p.id AND vote = -1
    ),
    comment_count = (
      SELECT COUNT(*) 
      FROM comments 
      WHERE post_id = p.id
    );
END;
$$;