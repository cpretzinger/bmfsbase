import { supabase } from '../supabase/supabaseClient';

interface VerifiedAttendance {
  id: string;
  user_id: string;
  concert_id: string;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const attendanceService = {
  async submitAttendance(concertId: string, proofUrl: string): Promise<VerifiedAttendance> {
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

  async getAttendanceForConcert(concertId: string): Promise<VerifiedAttendance | null> {
    const { data, error } = await supabase
      .from('verified_attendance')
      .select('*')
      .eq('concert_id', concertId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserAttendance(): Promise<VerifiedAttendance[]> {
    const { data, error } = await supabase
      .from('verified_attendance')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};