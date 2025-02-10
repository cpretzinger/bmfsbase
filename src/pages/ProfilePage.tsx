import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile, useUserStats, useGameStats, useCommunityStats, useUpdateProfile } from '../hooks/useProfile';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { 
  MapPin, 
  Music, 
  Trophy, 
  MessageSquare, 
  Star, 
  Calendar,
  Edit3,
  Loader,
  Award,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    favorite_tour: ''
  });

  // If no userId is provided and user is logged in, use their ID
  const effectiveUserId = userId || user?.id;
  const isOwnProfile = user && (!userId || user.id === userId);

  // Redirect to auth if trying to view own profile while not logged in
  useEffect(() => {
    if (!user && !userId) {
      navigate('/auth');
      return;
    }
  }, [user, userId, navigate]);

  // Redirect to home if no effective user ID
  useEffect(() => {
    if (!effectiveUserId) {
      navigate('/');
      return;
    }
  }, [effectiveUserId, navigate]);

  const { 
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useProfile(effectiveUserId);
  
  const { 
    data: userStats,
    isLoading: isLoadingStats 
  } = useUserStats(effectiveUserId);
  
  const { 
    data: gameStats,
    isLoading: isLoadingGameStats 
  } = useGameStats(effectiveUserId);
  
  const { 
    data: communityStats,
    isLoading: isLoadingCommunityStats 
  } = useCommunityStats(effectiveUserId);

  const updateProfile = useUpdateProfile();

  // Show loading state
  if (isLoadingProfile || isLoadingStats || isLoadingGameStats || isLoadingCommunityStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show error state
  if (profileError || !profile?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The requested profile could not be found.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        ...editForm
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const memberSince = profile.profile.created_at 
    ? format(new Date(profile.profile.created_at), 'MMMM d, yyyy')
    : 'Loading...';

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg" />
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            {isOwnProfile ? (
              <ProfilePictureUpload 
                currentUrl={profile.profile.avatar_url} 
                username={profile.profile.username}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white p-1">
                <img
                  src={profile.profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.profile.username}`}
                  alt={profile.profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            )}
            <div className="pb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{profile.profile.username}</h1>
                {communityStats?.contribution_rank <= 10 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Top Contributor
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Member since {memberSince}
              </p>
            </div>
          </div>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditForm({
                  username: profile.profile.username || '',
                  bio: profile.profile.bio || '',
                  location: profile.profile.location || '',
                  favorite_tour: profile.profile.favorite_tour || ''
                });
              }}
              className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="mb-8">
            <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Favorite Tour
                  </label>
                  <input
                    type="text"
                    value={editForm.favorite_tour}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      favorite_tour: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateProfile.isPending ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Show Stats */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Show Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Music className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">
                        {userStats?.shows_attended || 0}
                      </div>
                      <div className="text-gray-600">Shows Attended</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Music className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">
                        {userStats?.unique_songs || 0}
                      </div>
                      <div className="text-gray-600">Unique Songs Heard</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">
                        {userStats?.states_visited?.length || 0}
                      </div>
                      <div className="text-gray-600">States Visited</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold">
                        {userStats?.tours_attended || 0}
                      </div>
                      <div className="text-gray-600">Tours Attended</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Game Achievements */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Game Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span>Bingos Won</span>
                    </div>
                    <span className="font-semibold">{gameStats?.bingos_won || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span>Prediction Points</span>
                    </div>
                    <span className="font-semibold">{gameStats?.prediction_points || 0}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span>Prediction Wins</span>
                    </div>
                    <span className="font-semibold">{gameStats?.prediction_wins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span>Roulette High Score</span>
                    </div>
                    <span className="font-semibold">{gameStats?.roulette_high_score || 0}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="font-medium">Won Billy Bingo!</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    View
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Posted a show review</p>
                      <p className="text-sm text-gray-600">3 days ago</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    View
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Contribution Rank</div>
                    <div className="text-gray-600">
                      #{communityStats?.contribution_rank || '-'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Total Posts</div>
                    <div className="text-gray-600">
                      {communityStats?.total_posts || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Total Upvotes</div>
                    <div className="text-gray-600">
                      {communityStats?.total_upvotes || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Shows */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Shows</h3>
              <div className="text-center py-8 text-gray-600">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming shows marked</p>
                <button className="mt-4 text-blue-600 hover:text-blue-700">
                  Browse Shows
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}