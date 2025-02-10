export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  first_show_date?: string;
  favorite_tour?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  email_notifications: boolean;
  show_attendance_public: boolean;
  show_stats_public: boolean;
}

export interface UserBadge {
  badge_code: string;
  earned_at: string;
}

export interface FavoriteSong {
  song_id: string;
  title: string;
  added_at: string;
  notes?: string;
}

export interface FavoriteVenue {
  venue: string;
  city: string;
  state?: string;
  country: string;
  added_at: string;
  notes?: string;
}

export interface ExtendedProfile {
  profile: UserProfile;
  preferences: UserPreferences;
  badges: UserBadge[];
  favorite_songs: FavoriteSong[];
  favorite_venues: FavoriteVenue[];
}

export interface UserStats {
  shows_attended: number;
  unique_songs: number;
  total_songs: number;
  most_seen_song: {
    title: string;
    count: number;
  };
  states_visited: string[];
  tours_attended: number;
}

export interface GameStats {
  bingos_won: number;
  prediction_points: number;
  prediction_wins: number;
  roulette_high_score: number;
  total_games_played: number;
}

export interface CommunityStats {
  total_posts: number;
  total_comments: number;
  total_upvotes: number;
  contribution_rank: number;
}