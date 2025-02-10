import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  created_at: string;
  upvotes: number;
}

interface ConcertReviewProps {
  review: Review;
  onUpvote: (id: string) => void;
}

export default function ConcertReview({ review, onUpvote }: ConcertReviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {review.user.name[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <Link 
              to={`/profile/${review.user.id}`}
              className="font-medium hover:text-blue-600 transition-colors"
            >
              {review.user.name}
            </Link>
            <p className="text-sm text-gray-600">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="font-medium">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{review.content}</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onUpvote(review.id)}
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{review.upvotes}</span>
        </button>
        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
          <MessageSquare className="w-4 h-4" />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
}