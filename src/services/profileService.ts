import { supabase } from '../supabase/supabaseClient';
import type { 
  UserProfile, 
  UserStats, 
  GameStats, 
  CommunityStats,
  ExtendedProfile,
  UserPreferences,
  FavoriteVenue
} from '../types/profile';

export const profileService = {
  async getProfile(userId: string): Promise<ExtendedProfile> {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .rpc('get_user_profile_extended', { profile_id: userId });

    if (error) throw error;
    return data;
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (!profile.id) throw new Error('User ID is required');
    
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
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .rpc('get_user_stats', { input_user_id: userId });

    if (error) throw error;
    return data;
  },

  async getGameStats(userId: string): Promise<GameStats> {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .rpc('get_user_game_stats', { input_user_id: userId });

    if (error) throw error;
    return data;
  },

  async getCommunityStats(userId: string): Promise<CommunityStats> {
    if (!userId) throw new Error('User ID is required');
    
    const { data, error } = await supabase
      .rpc('get_user_community_stats', { input_user_id: userId });

    if (error) throw error;
    return data;
  }
};