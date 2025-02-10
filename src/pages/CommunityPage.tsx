import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Users,
  AlertTriangle,
  Plus,
  Filter,
  Award,
  Star
} from 'lucide-react';
import { usePosts, useCommunityStats, useTopContributors, useVote } from '../hooks/useCommunity';
import { useAuth } from '../hooks/useAuth';

const categories = [
  { id: 'all', name: 'All Posts' },
  { id: 'show-reviews', name: 'Show Reviews' },
  { id: 'discussion', name: 'General Discussion' },
  { id: 'upcoming-shows', name: 'Upcoming Shows' },
  { id: 'tickets', name: 'Buy/Sell Tickets' }
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  const { data: posts, isLoading: isLoadingPosts } = usePosts({
    category: selectedCategory,
    sort: sortBy,
    search: searchQuery
  });

  const { data: stats } = useCommunityStats();
  const { data: topContributors } = useTopContributors(3);
  const voteMutation = useVote();

  const handleVote = async (postId: string, direction: 'up' | 'down') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await voteMutation.mutateAsync({
        type: 'post',
        id: postId,
        direction
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community</h1>
            <p className="text-gray-600">
              Join the conversation with fellow fans
            </p>
          </div>
          <button
            onClick={() => user ? navigate('/community/new') : navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto mb-6 bg-white rounded-lg shadow-sm">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setSortBy('hot')}
                  className={`text-sm font-medium ${
                    sortBy === 'hot' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => setSortBy('new')}
                  className={`text-sm font-medium ${
                    sortBy === 'new' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setSortBy('top')}
                  className={`text-sm font-medium ${
                    sortBy === 'top' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Top
                </button>
              </div>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Posts List */}
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Vote Column */}
                    <div className="p-4 flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleVote(post.id, 'up')}
                          className="text-gray-400 hover:text-blue-600"
                          disabled={voteMutation.isPending}
                        >
                          <ChevronUp className="w-6 h-6" />
                        </button>
                        <span className="font-medium">
                          {post.upvotes - post.downvotes}
                        </span>
                        <button
                          onClick={() => handleVote(post.id, 'down')}
                          className="text-gray-400 hover:text-red-600"
                          disabled={voteMutation.isPending}
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            {post.is_pinned && (
                              <div className="text-xs text-blue-600 font-medium mb-1">
                                📌 Pinned Post
                              </div>
                            )}
                            <h3 
                              onClick={() => navigate(`/community/posts/${post.id}`)}
                              className="text-lg font-medium hover:text-blue-600 cursor-pointer"
                            >
                              {post.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                              <span>by {post.author?.username}</span>
                              <span>•</span>
                              <span>{formatTimestamp(post.created_at)}</span>
                              {post.tags?.map(tag => (
                                <span
                                  key={tag}
                                  className="bg-gray-100 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comment_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? "No posts match your search criteria" 
                    : "Be the first to start a discussion!"}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Community Stats */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{stats.total_members}</div>
                      <div className="text-sm text-gray-600">members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{stats.posts_today}</div>
                      <div className="text-sm text-gray-600">posts today</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{stats.active_users}</div>
                      <div className="text-sm text-gray-600">active now</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Contributors */}
            {topContributors && topContributors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
                <div className="space-y-4">
                  {topContributors.map((user, index) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {index === 0 ? (
                            <Star className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <span className="text-gray-600">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {user.username}
                            {user.badge === 'moderator' && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                                MOD
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.points} points
                          </div>
                        </div>
                      </div>
                      {user.badge === 'top-contributor' && (
                        <Award className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Be respectful and constructive in discussions</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>No hate speech or harassment</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Keep discussions on-topic and relevant</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 mt-2">
                  View Full Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}