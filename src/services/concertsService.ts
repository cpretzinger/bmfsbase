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

export const concertsService = {
  async getConcerts(options?: { 
    past?: boolean; 
    limit?: number;
    orderBy?: 'asc' | 'desc';
  }): Promise<Concert[]> {
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
    return data;
  },

  async getConcertById(id: string): Promise<Concert | null> {
    const { data, error } = await supabase
      .from('concerts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};