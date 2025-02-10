export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  category: string;
  tags: string[];
  is_pinned: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  parent_id?: string;
}

export interface CommunityStats {
  total_members: number;
  posts_today: number;
  active_users: number;
}

export interface TopContributor {
  user_id: string;
  username: string;
  points: number;
  badge?: 'moderator' | 'top-contributor';
  avatar_url?: string;
}