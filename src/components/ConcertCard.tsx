import { format } from 'date-fns';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';

interface ConcertCardProps {
  id: string;
  venue: string;
  city: string;
  state?: string | null;
  country: string;
  date: string;
  onClick?: () => void;
}

export default function ConcertCard({ 
  id,
  venue, 
  city, 
  state, 
  country, 
  date,
  onClick 
}: ConcertCardProps) {
  const { user } = useAuth();
  const { attendance } = useAttendance(id);
  const location = [city, state, country].filter(Boolean).join(', ');
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');
  const isVerified = attendance?.status === 'approved';

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      {user && isVerified && (
        <div className="absolute top-4 right-4">
          <CheckCircle className="w-6 h-6 text-blue-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-4">{venue}</h3>
      <div className="space-y-2 text-gray-600">
        <div className="flex items-center space-x-2">
          <MapPin size={18} />
          <span>{location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={18} />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}