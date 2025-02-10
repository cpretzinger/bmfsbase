import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { concertsService } from '../services/concertsService';
import { format } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Clock, 
  Camera, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Music
} from 'lucide-react';
import VerifiedAttendanceUpload from '../components/VerifiedAttendanceUpload';
import SetlistDisplay from '../components/SetlistDisplay';
import ConcertReview from '../components/ConcertReview';
import MediaGallery from '../components/MediaGallery';
import { useAuth } from '../hooks/useAuth';

// Mock data for demonstration
const mockSetlist = {
  sets: [
    {
      name: 'Set 1',
      songs: [
        { 
          id: '1', 
          title: 'Dust in a Baggie',
          duration: '8:15',
          notes: 'Extended jam into Meet Me at the Creek'
        },
        { 
          id: '2', 
          title: 'Meet Me at the Creek',
          duration: '12:30',
          guests: ['Jerry Douglas']
        }
      ]
    },
    {
      name: 'Set 2',
      songs: [
        { 
          id: '3', 
          title: 'Thunder',
          duration: '15:45',
          notes: 'With extended jam'
        }
      ]
    },
    {
      name: 'Encore',
      songs: [
        { 
          id: '4', 
          title: 'Black Clouds',
          duration: '7:20'
        }
      ]
    }
  ],
  totalDuration: '2h 30m'
};

const mockReviews = [
  {
    id: '1',
    user: {
      name: 'JohnD',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop'
    },
    rating: 4.8,
    content: 'Incredible show! The Thunder jam in the second set was mind-blowing.',
    created_at: '2025-02-09T12:00:00Z',
    upvotes: 15
  }
];

const mockMedia = [
  {
    id: '1',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400',
    title: 'Second Set Opener',
    source: 'Concert Photography'
  }
];

export default function ConcertDetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  
  const { data: concert, isLoading } = useQuery({
    queryKey: ['concert', id],
    queryFn: () => id ? concertsService.getConcertById(id) : null,
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Concert not found</div>
      </div>
    );
  }

  const location = [concert.city, concert.state, concert.country]
    .filter(Boolean)
    .join(', ');
  const formattedDate = format(new Date(concert.date), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/concerts')}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Shows
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/concerts/prev-id')}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Show
            </button>
            <button
              onClick={() => navigate('/concerts/next-id')}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
            >
              Next Show
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{concert.venue}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{location}</span>
                </div>
                {concert.notes?.includes('Winter 2025 Tour') && (
                  <div className="text-blue-600 font-medium">
                    Winter 2025 Tour
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              {user && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  I Was There
                </button>
              )}
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Share
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-medium">4.8/5.0</div>
                <div className="text-sm text-gray-600">30 ratings</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">56 attendees</div>
                <div className="text-sm text-gray-600">verified</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">2h 30m</div>
                <div className="text-sm text-gray-600">total duration</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">22 songs</div>
                <div className="text-sm text-gray-600">3 debuts</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Setlist */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Setlist</h2>
              <SetlistDisplay {...mockSetlist} />
            </section>

            {/* Media */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Media</h2>
                {user && (
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <Camera className="w-5 h-5" />
                    Add Photos
                  </button>
                )}
              </div>
              <MediaGallery media={mockMedia} />
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Fan Reviews</h2>
                {user && (
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <MessageSquare className="w-5 h-5" />
                    Write Review
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {mockReviews.map(review => (
                  <ConcertReview
                    key={review.id}
                    review={review}
                    onUpvote={(id) => console.log('Upvote review:', id)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendance Verification */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Verify Your Attendance</h3>
              <VerifiedAttendanceUpload concertId={concert.id} />
            </div>

            {/* Show Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Show Stats</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Debuts</h4>
                  <p className="text-gray-600">None</p>
                </div>
                <div>
                  <h4 className="font-medium">Tour Position</h4>
                  <p className="text-gray-600">Show #12 of Winter Tour 2025</p>
                </div>
                <div>
                  <h4 className="font-medium">Last Time Played</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Thunder: 8 shows (12/31/24)</li>
                    <li>Dust in a Baggie: 3 shows (1/15/25)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Listen & Watch</h3>
              <div className="space-y-3">
                <a
                  href="#nugs"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600"
                >
                  Listen on Nugs.net
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="#youtube"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600"
                >
                  Watch on YouTube
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Poster */}
            {concert.notes?.includes('poster') && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Show Poster</h3>
                <img
                  src="https://images.unsplash.com/photo-1501612780327-45045538702b?w=400"
                  alt="Show Poster"
                  className="w-full rounded-lg"
                />
                <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Buy Poster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}