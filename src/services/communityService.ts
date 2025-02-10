import { supabase } from '../supabase/supabaseClient';
import { Post, Comment, CommunityStats, TopContributor } from '../types/community';

export const communityService = {
  async getPosts({
    category = 'all',
    sort = 'hot',
    search = '',
    limit = 20,
    offset = 0
  }: {
    category?: string;
    sort?: 'hot' | 'new' | 'top';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Post[]> {
    let query = supabase
      .from('post_details')
      .select('*');

    // Apply category filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'hot':
        query = query.order('upvotes', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('upvotes', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  async getPost(id: string): Promise<Post> {
    const { data, error } = await supabase
      .rpc('get_post_with_details', { post_id: id });

    if (error) throw error;
    return data;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_profiles!fk_author_profile(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'comment_count'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes'>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async vote(
    type: 'post' | 'comment',
    id: string,
    direction: 'up' | 'down'
  ): Promise<void> {
    const table = type === 'post' ? 'post_votes' : 'comment_votes';
    const idField = type === 'post' ? 'post_id' : 'comment_id';

    const { error } = await supabase
      .from(table)
      .upsert([
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          [idField]: id,
          vote: direction === 'up' ? 1 : -1
        }
      ]);

    if (error) throw error;
  },

  async getCommunityStats(): Promise<CommunityStats> {
    const { data, error } = await supabase
      .rpc('get_community_stats');

    if (error) throw error;
    return data;
  },

  async getTopContributors(limit = 10): Promise<TopContributor[]> {
    const { data, error } = await supabase
      .rpc('get_top_contributors', { limit_count: limit });

    if (error) throw error;
    return data;
  }
};