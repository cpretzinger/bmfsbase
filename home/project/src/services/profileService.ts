import { supabase } from '../supabase/supabaseClient';
import type { 
  UserProfile, 
  UserStats, 
  GameStats, 
  CommunityStats,
  ExtendedProfile,
  UserPreferences,
  FavoriteSong,
  FavoriteVenue
} from '../types/profile';

export const profileService = {
  async getProfile(userId: string): Promise<ExtendedProfile> {
    const { data, error } = await supabase
      .rpc('get_user_profile_extended', { profile_id: userId });

    if (error) throw error;
    return data;
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .rpc('update_user_preferences', { preferences });

    if (error) throw error;
    return data;
  },

  async addFavoriteSong(songId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_songs')
      .insert([{ song_id: songId, notes }]);

    if (error) throw error;
  },

  async removeFavoriteSong(songId: string): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_songs')
      .delete()
      .eq('song_id', songId);

    if (error) throw error;
  },

  async addFavoriteVenue(venue: Omit<FavoriteVenue, 'added_at'>): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_venues')
      .insert([venue]);

    if (error) throw error;
  },

  async removeFavoriteVenue(venue: Pick<FavoriteVenue, 'venue' | 'city' | 'country'>): Promise<void> {
    const { error } = await supabase
      .from('user_favorite_venues')
      .delete()
      .match(venue);

    if (error) throw error;
  },

  async getUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id: userId });

    if (error) throw error;
    return data;
  },

  async getGameStats(userId: string): Promise<GameStats> {
    const { data, error } = await supabase
      .rpc('get_user_game_stats', { user_id: userId });

    if (error) throw error;
    return data;
  },

  async getCommunityStats(userId: string): Promise<CommunityStats> {
    const { data, error } = await supabase
      .rpc('get_user_community_stats', { user_id: userId });

    if (error) throw error;
    return data;
  }
};