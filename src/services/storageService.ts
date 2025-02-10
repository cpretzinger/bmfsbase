import { supabase } from '../supabase/supabaseClient';

export const storageService = {
  async uploadProfilePicture(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteProfilePicture(url: string): Promise<void> {
    const path = url.split('/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([`profiles/${path}`]);

    if (error) throw error;
  }
};