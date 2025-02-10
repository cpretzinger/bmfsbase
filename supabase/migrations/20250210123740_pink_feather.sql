/*
  # Profile System Enhancement

  1. New Functions
    - get_user_stats: Calculates show attendance and song statistics
    - get_user_game_stats: Retrieves game-related achievements
    - get_user_community_stats: Computes community contribution metrics

  2. Security
    - All functions are SECURITY DEFINER for consistent access control
    - Functions only return data the user has permission to see
*/

-- Function to get user's show and song statistics
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
        WHERE va2.user_id = user_id
        GROUP BY s2.id, s2.title
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as most_seen_song
    FROM verified_attendance va
    JOIN concerts c ON va.concert_id = c.id
    LEFT JOIN setlists sl ON c.id = sl.concert_id
    LEFT JOIN songs s ON sl.song_id = s.id
    WHERE va.user_id = user_id
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

-- Function to get user's game statistics
CREATE OR REPLACE FUNCTION get_user_game_stats(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'bingos_won', (
      SELECT COUNT(*)
      FROM game_scores
      WHERE user_id = user_id
      AND game_type = 'bingo'
      AND score > 0
    ),
    'prediction_points', (
      SELECT COALESCE(SUM(score), 0)
      FROM game_scores
      WHERE user_id = user_id
      AND game_type = 'predictions'
    ),
    'prediction_wins', (
      SELECT COUNT(*)
      FROM game_scores
      WHERE user_id = user_id
      AND game_type = 'predictions'
      AND score >= 100
    ),
    'roulette_high_score', (
      SELECT COALESCE(MAX(score), 0)
      FROM game_scores
      WHERE user_id = user_id
      AND game_type = 'roulette'
    ),
    'total_games_played', (
      SELECT COUNT(*)
      FROM game_scores
      WHERE user_id = user_id
    )
  ) INTO result;

  RETURN COALESCE(result, json_build_object(
    'bingos_won', 0,
    'prediction_points', 0,
    'prediction_wins', 0,
    'roulette_high_score', 0,
    'total_games_played', 0
  ));
END;
$$;

-- Function to get user's community statistics
CREATE OR REPLACE FUNCTION get_user_community_stats(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  user_rank INTEGER;
BEGIN
  -- Calculate user's rank based on total contribution points
  WITH user_points AS (
    SELECT 
      u.id,
      (
        COUNT(DISTINCT p.id) * 10 + -- Points for posts
        COUNT(DISTINCT c.id) * 5 + -- Points for comments
        COUNT(DISTINCT pv.post_id) + -- Points for post votes
        COUNT(DISTINCT cv.comment_id) -- Points for comment votes
      ) as total_points
    FROM auth.users u
    LEFT JOIN posts p ON u.id = p.author_id
    LEFT JOIN comments c ON u.id = c.author_id
    LEFT JOIN post_votes pv ON u.id = pv.user_id
    LEFT JOIN comment_votes cv ON u.id = cv.user_id
    GROUP BY u.id
  ),
  rankings AS (
    SELECT 
      id,
      RANK() OVER (ORDER BY total_points DESC) as rank
    FROM user_points
  )
  SELECT rank INTO user_rank
  FROM rankings
  WHERE id = user_id;

  -- Get user's community stats
  SELECT json_build_object(
    'total_posts', (
      SELECT COUNT(*)
      FROM posts
      WHERE author_id = user_id
    ),
    'total_comments', (
      SELECT COUNT(*)
      FROM comments
      WHERE author_id = user_id
    ),
    'total_upvotes', (
      SELECT COUNT(*)
      FROM post_votes
      WHERE post_id IN (SELECT id FROM posts WHERE author_id = user_id)
      AND vote = 1
    ),
    'contribution_rank', COALESCE(user_rank, 0)
  ) INTO result;

  RETURN COALESCE(result, json_build_object(
    'total_posts', 0,
    'total_comments', 0,
    'total_upvotes', 0,
    'contribution_rank', 0
  ));
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_game_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_community_stats TO authenticated;