import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, Dice1Icon as DiceIcon, ListMusic, Trophy, Users, Star, Clock, ChevronRight } from 'lucide-react';
import BillyBingo from '../components/games/BillyBingo';
import SetlistRoulette from '../components/games/SetlistRoulette';
import ShowPredictions from '../components/games/ShowPredictions';

type GameType = 'bingo' | 'roulette' | 'predictions';

export default function GamesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeGame, setActiveGame] = useState<GameType | null>(
    (searchParams.get('game') as GameType) || null
  );

  const games = [
    {
      id: 'bingo',
      name: 'Billy Bingo',
      description: 'Mark off songs as they\'re played live. Get 5 in a row to win!',
      icon: Grid,
      stats: {
        activePlayers: 120,
        lastWinner: 'JamFan123',
        winTime: '2h ago'
      }
    },
    {
      id: 'roulette',
      name: 'Setlist Roulette',
      description: 'Test your knowledge by predicting the next song in historical setlists.',
      icon: DiceIcon, // Changed from Dice to DiceIcon
      stats: {
        highScore: 2500,
        totalPlays: 1500,
        avgScore: 850
      }
    },
    {
      id: 'predictions',
      name: 'Show Predictions',
      description: 'Predict the setlist & earn points. Make your picks before showtime!',
      icon: ListMusic,
      stats: {
        activeContests: 3,
        topPredictor: 'StringMaster',
        points: 1200
      }
    }
  ];

  // If a specific game is active, render that game's component
  if (activeGame === 'bingo') {
    return <BillyBingo onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'roulette') {
    return <SetlistRoulette onBack={() => setActiveGame(null)} />;
  }
  if (activeGame === 'predictions') {
    return <ShowPredictions onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fan Games</h1>
          <p className="text-gray-600">
            Test your knowledge, make predictions, and compete with other fans
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Games Grid */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <game.icon className="w-8 h-8 text-blue-600" />
                      <h2 className="text-xl font-semibold">{game.name}</h2>
                    </div>
                    <p className="text-gray-600 mb-6">{game.description}</p>
                    {'activePlayers' in game.stats && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                        <Users className="w-4 h-4" />
                        <span>{game.stats.activePlayers} players active</span>
                      </div>
                    )}
                    {'highScore' in game.stats && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                        <Trophy className="w-4 h-4" />
                        <span>High Score: {game.stats.highScore} pts</span>
                      </div>
                    )}
                    {'activeContests' in game.stats && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{game.stats.activeContests} contests open</span>
                      </div>
                    )}
                    <button
                      onClick={() => setActiveGame(game.id as GameType)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Players</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">StringMaster</p>
                      <p className="text-sm text-gray-600">1,200 points</p>
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">JamFan123</p>
                      <p className="text-sm text-gray-600">980 points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Winners */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Winners</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Billy Bingo Winner</p>
                    <p className="text-sm text-gray-600">JamFan123 - 2h ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Perfect Prediction</p>
                    <p className="text-sm text-gray-600">StringMaster - 1d ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Players</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Games Played Today</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Contests</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}