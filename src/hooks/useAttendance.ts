import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';

interface VerifiedAttendance {
  id: string;
  user_id: string;
  concert_id: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function useAttendance(concertId?: string) {
  const queryClient = useQueryClient();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', concertId],
    queryFn: async () => {
      if (!concertId) return null;
      const { data, error } = await supabase
        .from('verified_attendance')
        .select('*')
        .eq('concert_id', concertId)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error && error.code !== 'PGRST116') throw error;
      return data as VerifiedAttendance | null;
    },
    enabled: !!concertId
  });

  const submitAttendance = useMutation({
    mutationFn: async ({ 
      concertId, 
      proofUrl 
    }: { 
      concertId: string; 
      proofUrl: string; 
    }) => {
      const { data, error } = await supabase
        .from('verified_attendance')
        .insert([
          {
            concert_id: concertId,
            proof_url: proofUrl,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', concertId] });
    }
  });

  return {
    attendance,
    isLoading,
    submitAttendance
  };
}