import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import { Post, Comment } from '../types/community';

export function usePosts(options: {
  category?: string;
  sort?: 'hot' | 'new' | 'top';
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['posts', options],
    queryFn: () => communityService.getPosts(options)
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => communityService.getPost(id)
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'comment_count'>) =>
      communityService.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => communityService.getComments(postId)
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes'>) =>
      communityService.createComment(comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.post_id] });
    }
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id, direction }: { type: 'post' | 'comment'; id: string; direction: 'up' | 'down' }) =>
      communityService.vote(type, id, direction),
    onSuccess: (_, variables) => {
      if (variables.type === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments', variables.id] });
      }
    }
  });
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['communityStats'],
    queryFn: () => communityService.getCommunityStats()
  });
}

export function useTopContributors(limit?: number) {
  return useQuery({
    queryKey: ['topContributors', limit],
    queryFn: () => communityService.getTopContributors(limit)
  });
}