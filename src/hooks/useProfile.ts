import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import type { 
  UserProfile, 
  UserStats, 
  GameStats, 
  CommunityStats,
  UserPreferences,
  FavoriteVenue
} from '../types/profile';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return profileService.getProfile(userId);
    },
    enabled: !!userId // Only run query if userId is defined
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => 
      profileService.updateProfile(profile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    }
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      profileService.updatePreferences(preferences),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useFavoriteSongs() {
  const queryClient = useQueryClient();

  return {
    addFavorite: useMutation({
      mutationFn: ({ songId, notes }: { songId: string; notes?: string }) =>
        profileService.addFavoriteSong(songId, notes),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }),
    removeFavorite: useMutation({
      mutationFn: (songId: string) =>
        profileService.removeFavoriteSong(songId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    })
  };
}

export function useFavoriteVenues() {
  const queryClient = useQueryClient();

  return {
    addFavorite: useMutation({
      mutationFn: (venue: Omit<FavoriteVenue, 'added_at'>) =>
        profileService.addFavoriteVenue(venue),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }),
    removeFavorite: useMutation({
      mutationFn: (venue: Pick<FavoriteVenue, 'venue' | 'city' | 'country'>) =>
        profileService.removeFavoriteVenue(venue),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    })
  };
}

export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return profileService.getUserStats(userId);
    },
    enabled: !!userId
  });
}

export function useGameStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['gameStats', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return profileService.getGameStats(userId);
    },
    enabled: !!userId
  });
}

export function useCommunityStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['profileCommunityStats', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return profileService.getCommunityStats(userId);
    },
    enabled: !!userId
  });
}