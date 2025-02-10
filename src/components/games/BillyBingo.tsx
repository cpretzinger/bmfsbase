import { useState } from 'react';
import { ChevronLeft, Trophy, Users, Grid } from 'lucide-react';

interface BingoSquare {
  id: string;
  song: string;
  isMarked: boolean;
}

interface BingoProps {
  onBack: () => void;
}

// Mock data - in production this would come from your API
const generateBingoCard = () => {
  const songs = [
    'Dust in a Baggie',
    'Thunder',
    'Meet Me at the Creek',
    'Away From the Mire',
    'Hide and Seek',
    'Red Daisy',
    'Fire Line',
    'Love and Regret',
    'Must Be Seven',
    'Taking Water',
    'Know It All',
    'Pyramid Country',
    'Turmoil & Tinfoil',
    'All Fall Down',
    'Running',
    'Secrets',
    'While I\'m Waiting Here',
    'Highway Hypnosis',
    'Ice Bridges',
    'End of the Rainbow',
    'Heartbeat of America',
    'Wargasm',
    'Black Clouds',
    'In the Morning Light',
    'BMFS'
  ];

  // Shuffle songs and take 24 (center is free space)
  const shuffled = [...songs].sort(() => Math.random() - 0.5).slice(0, 24);
  
  // Insert free space in the middle
  shuffled.splice(12, 0, 'FREE');

  return shuffled.map((song, index) => ({
    id: String(index),
    song,
    isMarked: song === 'FREE'
  }));
};

export default function BillyBingo({ onBack }: BingoProps) {
  const [squares, setSquares] = useState<BingoSquare[]>(generateBingoCard());
  const [hasWon, setHasWon] = useState(false);

  const handleSquareClick = (id: string) => {
    setSquares(prev => prev.map(square => 
      square.id === id ? { ...square, isMarked: !square.isMarked } : square
    ));
    
    // Check for win condition after marking
    checkForWin();
  };

  const checkForWin = () => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (squares.slice(i * 5, (i + 1) * 5).every(square => square.isMarked)) {
        setHasWon(true);
        return;
      }
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      if (squares.filter((_, index) => index % 5 === i).every(square => square.isMarked)) {
        setHasWon(true);
        return;
      }
    }

    // Check diagonals
    const diagonal1 = [0, 6, 12, 18, 24].every(index => squares[index].isMarked);
    const diagonal2 = [4, 8, 12, 16, 20].every(index => squares[index].isMarked);
    if (diagonal1 || diagonal2) {
      setHasWon(true);
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
              <Users className="w-5 h-5" />
              <span>120 players active</span>
            </div>
            <button 
              onClick={() => {
                setSquares(generateBingoCard());
                setHasWon(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              New Card
            </button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Grid className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Billy Bingo</h1>
          </div>
          <p className="text-gray-600">
            Mark off songs as they're played live. Get 5 in a row to win!
          </p>
        </div>

        {/* Bingo Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="grid grid-cols-5 gap-2 bg-white p-4 rounded-lg shadow-md">
            {squares.map((square) => (
              <button
                key={square.id}
                onClick={() => handleSquareClick(square.id)}
                className={`aspect-square p-2 rounded-md text-center flex items-center justify-center transition-colors ${
                  square.isMarked
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                } ${square.song === 'FREE' ? 'bg-yellow-100' : ''}`}
              >
                <span className="text-sm font-medium">{square.song}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Win Message */}
        {hasWon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">BINGO!</h2>
              <p className="text-gray-600 mb-6">
                Congratulations! You've got a winning combination!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSquares(generateBingoCard());
                    setHasWon(false);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  New Game
                </button>
                <button
                  onClick={() => setHasWon(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Keep Playing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}