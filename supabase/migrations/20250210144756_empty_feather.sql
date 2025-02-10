-- Add missing columns to comments if they don't exist
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Add missing columns to posts if they don't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Create or replace the get_user_stats function
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH user_attendance AS (
    SELECT 
      COUNT(DISTINCT va.concert_id) as shows_attended,
      COUNT(DISTINCT s.id) as unique_songs,
      COUNT(s.id) as total_songs,
      array_agg(DISTINCT c.state) FILTER (WHERE c.state IS NOT NULL) as states_visited,
      COUNT(DISTINCT EXTRACT(YEAR FROM c.date)) as tours_attended,
      (
        SELECT json_build_object(
          'title', s2.title,
          'count', COUNT(*)
        )
        FROM verified_attendance va2
        JOIN concerts c2 ON va2.concert_id = c2.id
        JOIN setlists sl2 ON c2.id = sl2.concert_id
        JOIN songs s2 ON sl2.song_id = s2.id
        WHERE va2.user_id = get_user_stats.user_id
        AND va2.status = 'approved'
        GROUP BY s2.id, s2.title
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as most_seen_song
    FROM verified_attendance va
    JOIN concerts c ON va.concert_id = c.id
    LEFT JOIN setlists sl ON c.id = sl.concert_id
    LEFT JOIN songs s ON sl.song_id = s.id
    WHERE va.user_id = get_user_stats.user_id
    AND va.status = 'approved'
  )
  SELECT json_build_object(
    'shows_attended', COALESCE(shows_attended, 0),
    'unique_songs', COALESCE(unique_songs, 0),
    'total_songs', COALESCE(total_songs, 0),
    'most_seen_song', most_seen_song,
    'states_visited', COALESCE(states_visited, ARRAY[]::text[]),
    'tours_attended', COALESCE(tours_attended, 0)
  ) INTO result
  FROM user_attendance;

  RETURN COALESCE(result, json_build_object(
    'shows_attended', 0,
    'unique_songs', 0,
    'total_songs', 0,
    'most_seen_song', NULL,
    'states_visited', ARRAY[]::text[],
    'tours_attended', 0
  ));
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;

-- Create or replace function to handle vote updates
CREATE OR REPLACE FUNCTION handle_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'post_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts 
      SET upvotes = upvotes + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END,
          downvotes = downvotes + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts 
      SET upvotes = upvotes - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END,
          downvotes = downvotes - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'comment_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE comments 
      SET upvotes = upvotes + CASE WHEN NEW.vote = 1 THEN 1 ELSE 0 END,
          downvotes = downvotes + CASE WHEN NEW.vote = -1 THEN 1 ELSE 0 END
      WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE comments 
      SET upvotes = upvotes - CASE WHEN OLD.vote = 1 THEN 1 ELSE 0 END,
          downvotes = downvotes - CASE WHEN OLD.vote = -1 THEN 1 ELSE 0 END
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for vote handling
DROP TRIGGER IF EXISTS handle_post_vote ON post_votes;
CREATE TRIGGER handle_post_vote
  AFTER INSERT OR DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION handle_vote();

DROP TRIGGER IF EXISTS handle_comment_vote ON comment_votes;
CREATE TRIGGER handle_comment_vote
  AFTER INSERT OR DELETE ON comment_votes
  FOR EACH ROW
  EXECUTE FUNCTION handle_vote();

-- Ensure proper RLS policies exist
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own votes on posts"
  ON post_votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own votes on comments"
  ON comment_votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);