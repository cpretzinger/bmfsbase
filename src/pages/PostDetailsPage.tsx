import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePost, useComments, useCreateComment, useVote } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';
import { useUserStats } from '../hooks/useProfile';
import { ChevronLeft, ChevronUp, ChevronDown, MessageSquare, Send, Music, CheckCircle, Trophy, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const { data: post, isLoading: isLoadingPost } = usePost(id!);
  const { data: comments, isLoading: isLoadingComments } = useComments(id!);
  const { data: authorStats } = useUserStats(post?.author_id);
  const createComment = useCreateComment();
  const voteMutation = useVote();

  if (isLoadingPost || isLoadingComments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Post not found</div>
      </div>
    );
  }

  const voteCount = (post.upvotes || 0) - (post.downvotes || 0);

  const handleVote = async (type: 'post' | 'comment', id: string, direction: 'up' | 'down') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await voteMutation.mutateAsync({ type, id, direction });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await createComment.mutateAsync({
        post_id: post.id,
        content: newComment,
        author_id: user.id
      });
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Community
          </button>
        </div>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            {/* Vote Column */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleVote('post', post.id, 'up')}
                className={`text-gray-400 hover:text-blue-600 ${
                  voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={voteMutation.isPending}
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <span className="font-medium">{voteCount}</span>
              <button
                onClick={() => handleVote('post', post.id, 'down')}
                className={`text-gray-400 hover:text-red-600 ${
                  voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={voteMutation.isPending}
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-2">
                {post.tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mr-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              
              {/* Author Info with Stats */}
              <div className="flex items-start gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {post.author?.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {post.author?.username?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/profile/${post.author_id}`}
                      className="font-medium hover:text-blue-600 transition-colors"
                    >
                      {post.author?.username}
                    </Link>
                    <span className="text-sm text-gray-600">
                      • {format(new Date(post.created_at), 'PPp')}
                    </span>
                  </div>
                  
                  {authorStats && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div className="text-sm">
                          <span className="font-medium">{authorStats.shows_attended}</span>
                          <span className="text-gray-600"> verified shows</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-blue-500" />
                        <div className="text-sm">
                          <span className="font-medium">{authorStats.unique_songs}</span>
                          <span className="text-gray-600"> unique songs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <div className="text-sm">
                          <span className="font-medium">{authorStats.tours_attended}</span>
                          <span className="text-gray-600"> tours</span>
                        </div>
                      </div>
                      {authorStats.most_seen_song && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-500" />
                          <div className="text-sm">
                            <span className="font-medium">{authorStats.most_seen_song.count}x</span>
                            <span className="text-gray-600"> {authorStats.most_seen_song.title}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="prose max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Comments</h2>

          {/* New Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={createComment.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {createComment.isPending ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {!comments || comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote('comment', comment.id, 'up')}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">
                      {(comment.upvotes || 0) - (comment.downvotes || 0)}
                    </span>
                    <button
                      onClick={() => handleVote('comment', comment.id, 'down')}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">
                      <Link 
                        to={`/profile/${comment.author_id}`}
                        className="font-medium hover:text-blue-600 transition-colors"
                      >
                        {comment.author?.username}
                      </Link>
                      {' • '}{format(new Date(comment.created_at), 'PPp')}
                    </div>
                    <div className="text-gray-800">{comment.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}