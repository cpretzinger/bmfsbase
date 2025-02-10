import { useState } from 'react';
import { ChevronLeft, Dice1Icon as DiceIcon, RefreshCw, Clock } from 'lucide-react';

interface SetlistRouletteProps {
  onBack: () => void;
}

// Mock data - in production this would come from your API
const mockSetlists = [
  {
    id: '1',
    date: '2024-12-31',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    songs: [
      'Dust in a Baggie',
      'Thunder',
      'Meet Me at the Creek',
      'Away From the Mire',
      'Hide and Seek'
    ]
  },
  {
    id: '2',
    date: '2024-12-30',
    venue: 'The Capitol Theatre',
    city: 'Port Chester, NY',
    songs: [
      'Red Daisy',
      'Fire Line',
      'Love and Regret',
      'Must Be Seven',
      'Taking Water'
    ]
  }
];

export default function SetlistRoulette({ onBack }: SetlistRouletteProps) {
  const [currentSetlist, setCurrentSetlist] = useState(mockSetlists[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);

  const handleSpin = () => {
    setIsSpinning(true);
    setShowAnswer(false);
    setGuess('');

    // Simulate spinning animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockSetlists.length);
      setCurrentSetlist(mockSetlists[randomIndex]);
      setIsSpinning(false);
    }, 1000);
  };

  const handleGuess = () => {
    setShowAnswer(true);
    if (guess.toLowerCase() === currentSetlist.venue.toLowerCase()) {
      setScore(prev => prev + 100);
    }
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
              <Clock className="w-5 h-5" />
              <span>Score: {score}</span>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <DiceIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Setlist Roulette</h1>
          </div>
          <p className="text-gray-600">
            Guess the venue from a random setlist. How well do you know your shows?
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Setlist:</h3>
              <div className="space-y-2">
                {currentSetlist.songs.map((song, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-md flex items-center gap-2"
                  >
                    <span className="text-gray-500">{index + 1}.</span>
                    <span>{song}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guess Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="guess" className="block text-sm font-medium text-gray-700">
                  Your Guess
                </label>
                <input
                  type="text"
                  id="guess"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter venue name..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={showAnswer || isSpinning}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleGuess}
                  disabled={!guess || showAnswer || isSpinning}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Guess
                </button>
                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <DiceIcon className="w-5 h-5" />
                      Spin Again
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Reveal */}
            {showAnswer && (
              <div className={`mt-6 p-4 rounded-md ${
                guess.toLowerCase() === currentSetlist.venue.toLowerCase()
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className="font-medium mb-2">
                  {guess.toLowerCase() === currentSetlist.venue.toLowerCase()
                    ? 'Correct! +100 points'
                    : 'Not quite...'}
                </h4>
                <p className="text-sm">
                  This show was at {currentSetlist.venue} in {currentSetlist.city} on{' '}
                  {new Date(currentSetlist.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}