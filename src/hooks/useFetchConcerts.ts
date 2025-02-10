import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';

interface Concert {
  id: string;
  venue: string;
  city: string;
  state: string | null;
  country: string;
  date: string;
  notes: string | null;
}

export function useFetchConcerts(options?: { 
  past?: boolean; 
  limit?: number;
  orderBy?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['concerts', options],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('concerts')
        .select('*');

      if (options?.past !== undefined) {
        query = query.filter(
          'date',
          options.past ? 'lt' : 'gte',
          today
        );
      }

      if (options?.orderBy) {
        query = query.order('date', { ascending: options.orderBy === 'asc' });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Concert[];
    }
  });
}