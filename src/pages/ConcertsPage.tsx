import { useState, useMemo } from 'react';
import { useFetchConcerts } from '../hooks/useFetchConcerts';
import ConcertCard from '../components/ConcertCard';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, ChevronDown, Search, History, BarChart3, Star } from 'lucide-react';
import { format, isSameMonth, isSameDay } from 'date-fns';

// Get the current year
const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 2023 + 1 },
  (_, i) => currentYear - i
);

export default function ConcertsPage() {
  const navigate = useNavigate();
  const [showPast, setShowPast] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allConcerts, isLoading } = useFetchConcerts({ 
    past: showPast,
    orderBy: showPast ? 'desc' : 'asc'
  });

  // Get today's shows in history
  const todayInHistory = useMemo(() => {
    if (!allConcerts) return [];
    const today = new Date();
    return allConcerts.filter(concert => {
      const concertDate = new Date(concert.date);
      return isSameMonth(today, concertDate) && 
             isSameDay(today, concertDate) && 
             concertDate.getFullYear() < today.getFullYear();
    });
  }, [allConcerts]);

  // Filter concerts by year and search query
  const filteredConcerts = useMemo(() => {
    return allConcerts?.filter(concert => {
      const matchesYear = !selectedYear || 
        new Date(concert.date).getFullYear() === selectedYear;
      
      const searchString = `${concert.venue} ${concert.city} ${concert.state || ''}`
        .toLowerCase();
      const matchesSearch = !searchQuery || 
        searchString.includes(searchQuery.toLowerCase());

      return matchesYear && matchesSearch;
    });
  }, [allConcerts, selectedYear, searchQuery]);

  // Group concerts by month/year
  const groupedConcerts = useMemo(() => {
    return filteredConcerts?.reduce((groups, concert) => {
      const date = new Date(concert.date);
      const monthYear = format(date, 'MMMM yyyy');
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(concert);
      return groups;
    }, {} as Record<string, typeof filteredConcerts>);
  }, [filteredConcerts]);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shows</h1>
          <p className="text-gray-600">
            {showPast 
              ? "Browse past shows and relive the memories" 
              : "Check out upcoming shows and make your predictions"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              {/* Show Type Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setShowPast(false);
                    setSelectedYear(null);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    !showPast 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setShowPast(true)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    showPast 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Past Shows
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by venue or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Year Filter - Only show for past shows */}
              {showPast && (
                <div className="relative">
                  <button
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{selectedYear || 'Filter by Year'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isYearDropdownOpen && (
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-10 border">
                      <button
                        onClick={() => {
                          setSelectedYear(null);
                          setIsYearDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        All Years
                      </button>
                      {years.map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setIsYearDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shows List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConcerts?.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shows found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? "No shows match your search criteria" 
                    : showPast 
                      ? "No past shows found for the selected filters" 
                      : "No upcoming shows announced yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedConcerts || {}).map(([monthYear, concerts]) => (
                  <div key={monthYear}>
                    <h2 className="text-xl font-semibold mb-4">{monthYear}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {concerts?.map((concert) => (
                        <div key={concert.id} className="relative">
                          {/* Special Event Tags */}
                          {concert.notes?.toLowerCase().includes('festival') && (
                            <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                              Festival
                            </div>
                          )}
                          {concert.notes?.toLowerCase().includes('night') && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                              Multi-Night Run
                            </div>
                          )}
                          <ConcertCard
                            id={concert.id}
                            venue={concert.venue}
                            city={concert.city}
                            state={concert.state}
                            country={concert.country}
                            date={concert.date}
                            onClick={() => navigate(`/concerts/${concert.id}`)}
                          />
                          {!showPast && (
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => navigate(`/games?concert=${concert.id}`)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                Predict Setlist
                              </button>
                              <a
                                href="#tickets"
                                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-center text-sm"
                              >
                                Find Tickets
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Today in History */}
            {todayInHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Today in History</h3>
                </div>
                <div className="space-y-4">
                  {todayInHistory.map(show => (
                    <div 
                      key={show.id}
                      onClick={() => navigate(`/concerts/${show.id}`)}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded-md -mx-2"
                    >
                      <p className="font-medium">{show.venue}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(show.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Teaser */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Tour Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Songs Played</span>
                  <span className="font-medium">120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Songs/Show</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unique Songs</span>
                  <span className="font-medium">85</span>
                </div>
                <button
                  onClick={() => navigate('/stats')}
                  className="w-full mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                >
                  View All Stats
                </button>
              </div>
            </div>

            {/* Fan Ratings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Top Rated Shows</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">MSG Night 2</p>
                    <p className="text-sm text-gray-600">12/31/24</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1">4.9</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Red Rocks N1</p>
                    <p className="text-sm text-gray-600">6/15/24</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}