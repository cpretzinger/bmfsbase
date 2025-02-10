import { useState, useEffect } from 'react';
import { useFetchConcerts } from '../hooks/useFetchConcerts';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Music, Users, GamepadIcon, Star, Clock, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';

// Helper function to calculate time until show
function getTimeUntil(date: string) {
  const diff = new Date(date).getTime() - new Date().getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: upcomingConcerts } = useFetchConcerts({ 
    past: false, 
    limit: 3,
    orderBy: 'asc'
  });
  const { data: recentConcerts } = useFetchConcerts({
    past: true,
    limit: 5,
    orderBy: 'desc'
  });

  // Auto-advance carousel
  useEffect(() => {
    if (!recentConcerts?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recentConcerts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [recentConcerts?.length]);

  const nextConcert = upcomingConcerts?.[0];
  const timeUntil = nextConcert ? getTimeUntil(nextConcert.date) : null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30">
          <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to BMFSBase
            </h1>
            <p className="text-2xl text-blue-200 mb-8 max-w-2xl">
              Your ultimate resource for tracking shows, making predictions, and connecting with the community
            </p>
            {!user && (
              <button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors w-fit"
              >
                Join the Community
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Next Show Countdown */}
      {nextConcert && timeUntil && (
        <section className="bg-blue-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-blue-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Next Show</h2>
                <p className="text-xl">{nextConcert.venue}</p>
                <p className="text-blue-200">{nextConcert.city}, {nextConcert.state}</p>
              </div>
              <div className="text-center mt-4 md:mt-0">
                <div className="text-3xl font-bold">
                  {timeUntil.days}d {timeUntil.hours}h
                </div>
                <p className="text-blue-200">until showtime</p>
              </div>
              <button
                onClick={() => navigate('/games')}
                className="mt-4 md:mt-0 bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make Your Predictions
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Shows Carousel */}
      {recentConcerts && recentConcerts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Recent Shows</h2>
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {recentConcerts.map((concert, index) => (
                    <div
                      key={concert.id}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold">{concert.venue}</h3>
                            <p className="text-gray-600">
                              {new Date(concert.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">{concert.city}, {concert.state}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="ml-1 text-gray-600">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => 
                  prev === 0 ? recentConcerts.length - 1 : prev - 1
                )}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => 
                  (prev + 1) % recentConcerts.length
                )}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Fan Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Tour Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Music className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-lg font-semibold">Songs Played</span>
              </div>
              <p className="text-3xl font-bold">120</p>
              <p className="text-gray-600">This Tour</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-lg font-semibold">Longest Jam</span>
              </div>
              <p className="text-3xl font-bold">18:42</p>
              <p className="text-gray-600">Thunder (2/8/25)</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-8 h-8 text-blue-600" />
                <span className="ml-2 text-lg font-semibold">Top Rated Show</span>
              </div>
              <p className="text-3xl font-bold">★ 4.9</p>
              <p className="text-gray-600">12/31/24 - NYC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Fan Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Billy Bingo</h3>
              <p className="text-gray-600 mb-4">
                Create your card with songs you think will be played tonight.
                Match five in a row to win!
              </p>
              <div className="text-sm text-blue-600 mb-4">
                120 players active
              </div>
              <button
                onClick={() => navigate('/games')}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Play Now
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Setlist Roulette</h3>
              <p className="text-gray-600 mb-4">
                Test your knowledge by predicting the next song in historical setlists.
              </p>
              <div className="text-sm text-blue-600 mb-4">
                High Score: 2,500 pts
              </div>
              <button
                onClick={() => navigate('/games')}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Play Now
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Show Predictions</h3>
              <p className="text-gray-600 mb-4">
                Predict the setlist & earn points. Make your picks before showtime!
              </p>
              <div className="text-sm text-blue-600 mb-4">
                Predictions close in 3h
              </div>
              <button
                onClick={() => navigate('/games')}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Enter Picks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Community Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Discussions</h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium">Asheville 2/8/25 - Epic second set!</h4>
                  <p className="text-gray-600 text-sm">45 comments • 2h ago</p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-medium">Best Thunder jam of the tour?</h4>
                  <p className="text-gray-600 text-sm">32 comments • 5h ago</p>
                </div>
                <div>
                  <h4 className="font-medium">Red Rocks predictions thread</h4>
                  <p className="text-gray-600 text-sm">28 comments • 8h ago</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Photo of the Week</h3>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80"
                  alt="Concert moment"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-4 text-gray-600">
                Captured by @concertphotographer at The Capitol Theatre
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="py-12 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-xl text-blue-200 mb-8">
              Track your shows, compete in setlist games, and connect with fellow fans.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </button>
          </div>
        </section>
      )}
    </div>
  );
}