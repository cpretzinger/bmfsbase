import { useState } from 'react';
import { ChevronLeft, ListMusic, Search, Plus, X, Trophy } from 'lucide-react';

interface ShowPredictionsProps {
  onBack: () => void;
}

interface Song {
  id: string;
  title: string;
}

// Mock data - in production this would come from your API
const availableSongs: Song[] = [
  { id: '1', title: 'Dust in a Baggie' },
  { id: '2', title: 'Thunder' },
  { id: '3', title: 'Meet Me at the Creek' },
  // Add more songs...
];

const mockShow = {
  id: '1',
  venue: 'Red Rocks Amphitheatre',
  city: 'Morrison, CO',
  date: '2025-06-15',
  closeTime: '2025-06-15T19:00:00Z'
};

export default function ShowPredictions({ onBack }: ShowPredictionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [showSongPicker, setShowSongPicker] = useState(false);

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSongs.find(s => s.id === song.id)
  );

  const handleAddSong = (song: Song) => {
    if (selectedSongs.length < 20) {
      setSelectedSongs([...selectedSongs, song]);
      setSearchQuery('');
      setShowSongPicker(false);
    }
  };

  const handleRemoveSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter(song => song.id !== songId));
  };

  const handleSubmit = () => {
    // In production, submit predictions to the API
    console.log('Submitting predictions:', selectedSongs);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Games
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Trophy className="w-5 h-5" />
              <span>Your Rank: #12</span>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ListMusic className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Show Predictions</h1>
          </div>
          <p className="text-gray-600">
            Predict the setlist for upcoming shows and compete for points!
          </p>
        </div>

        {/* Show Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">{mockShow.venue}</h2>
            <p className="text-gray-600 mb-4">
              {mockShow.city} - {new Date(mockShow.date).toLocaleDateString()}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                Predictions close at{' '}
                {new Date(mockShow.closeTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Form */}
        <div className="max-w-2xl mx-auto">
          {/* Song List */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Predictions</h3>
              <span className="text-sm text-gray-600">
                {selectedSongs.length}/20 songs
              </span>
            </div>

            {selectedSongs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No songs selected yet. Click "Add Song" to start building your prediction!
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{index + 1}.</span>
                      <span>{song.title}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedSongs.length < 20 && (
              <button
                onClick={() => setShowSongPicker(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600"
              >
                <Plus className="w-5 h-5" />
                Add Song
              </button>
            )}
          </div>

          {/* Song Picker Modal */}
          {showSongPicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Add Song</h3>
                    <button
                      onClick={() => setShowSongPicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                      autoFocus
                    />
                  </div>

                  {/* Song List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredSongs.map(song => (
                      <button
                        key={song.id}
                        onClick={() => handleAddSong(song)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                      >
                        {song.title }
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={selectedSongs.length === 0}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Predictions
          </button>

          {/* Instructions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">How to Play</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Select up to 20 songs you think will be played</li>
                <li>Submit your predictions before the show starts</li>
                <li>Earn points for each correct prediction</li>
                <li>Bonus points for correct song positions</li>
                <li>Compete with other fans on the leaderboard!</li>
              </ol>
            </div>
          </div>

          {/* Scoring Info */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Scoring</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct song prediction</span>
                  <span className="font-medium">1 point</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct position bonus</span>
                  <span className="font-medium">2 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Set opener/closer bonus</span>
                  <span className="font-medium">3 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Encore prediction bonus</span>
                  <span className="font-medium">5 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}