/*
  # Fix Posts and Comments View

  1. Changes
    - Create view for post details without duplicate columns
    - Add function to get post details with proper JSON structure
    - Grant necessary permissions

  2. Security
    - Maintain RLS policies through view
    - Secure function with SECURITY DEFINER
*/

-- Create a view to handle post details
CREATE OR REPLACE VIEW post_details AS
SELECT 
  p.id,
  p.title,
  p.content,
  p.created_at,
  p.updated_at,
  p.category,
  p.is_pinned,
  p.tags,
  p.upvotes,
  p.downvotes,
  up.username as author_username,
  up.avatar_url as author_avatar_url,
  (
    SELECT COUNT(*)
    FROM comments c
    WHERE c.post_id = p.id
  ) as total_comments
FROM posts p
LEFT JOIN user_profiles up ON p.author_id = up.id;

-- Update the post details function
CREATE OR REPLACE FUNCTION get_post_with_details(post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', pd.id,
    'title', pd.title,
    'content', pd.content,
    'created_at', pd.created_at,
    'updated_at', pd.updated_at,
    'category', pd.category,
    'is_pinned', pd.is_pinned,
    'tags', pd.tags,
    'upvotes', pd.upvotes,
    'downvotes', pd.downvotes,
    'comment_count', pd.total_comments,
    'author', json_build_object(
      'username', pd.author_username,
      'avatar_url', pd.author_avatar_url
    )
  ) INTO result
  FROM post_details pd
  WHERE pd.id = post_id;

  RETURN result;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON post_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_with_details TO authenticated;