import { Clock, Music, User } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  duration?: string;
  notes?: string;
  guests?: string[];
}

interface Set {
  name: string;
  songs: Song[];
}

interface SetlistDisplayProps {
  sets: Set[];
  totalDuration?: string;
}

export default function SetlistDisplay({ sets, totalDuration }: SetlistDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Duration Display */}
      {totalDuration && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>Total Duration: {totalDuration}</span>
        </div>
      )}

      {/* Sets */}
      {sets.map((set, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-xl font-semibold">{set.name}</h3>
          <div className="space-y-2">
            {set.songs.map((song, songIndex) => (
              <div
                key={song.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{songIndex + 1}.</span>
                      <h4 className="font-medium">{song.title}</h4>
                      {song.duration && (
                        <span className="text-sm text-gray-600">
                          ({song.duration})
                        </span>
                      )}
                    </div>
                    {song.notes && (
                      <p className="text-sm text-gray-600 mt-1">{song.notes}</p>
                    )}
                    {song.guests && song.guests.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>With {song.guests.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="text-blue-600 hover:text-blue-700"
                    title="View song history"
                  >
                    <Music className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}