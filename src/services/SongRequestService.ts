import { createClient } from '@supabase/supabase-js';

// Create service role client
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface SongRequest {
  id: string;
  user_id: string;
  song_name: string;
  artist_name?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

export const SongRequestService = {
  async createSongRequest(request: Omit<SongRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<SongRequest> {
    try {
      const { data, error } = await adminClient
        .from('song_requests')
        .insert([
          {
            ...request,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating song request:', error);
      throw error;
    }
  },

  async getRecentRequests(): Promise<SongRequest[]> {
    try {
      const { data, error } = await adminClient
        .rpc('get_recent_song_requests');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent song requests:', error);
      throw error;
    }
  },

  async approveSongRequest(id: string, userName: string): Promise<void> {
    try {
      const { error } = await adminClient
        .from('song_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving song request:', error);
      throw error;
    }
  },

  async rejectSongRequest(id: string): Promise<void> {
    try {
      const { error } = await adminClient
        .from('song_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting song request:', error);
      throw error;
    }
  },

  async deleteSongRequest(id: string): Promise<void> {
    try {
      const { error } = await adminClient
        .from('song_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting song request:', error);
      throw error;
    }
  },

  async clearOldRequests(): Promise<void> {
    try {
      const { error } = await adminClient
        .from('song_requests')
        .delete()
        .lt('created_at', new Date().toISOString().split('T')[0]);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing old song requests:', error);
      throw error;
    }
  },

  subscribeToSongRequests(callback: (payload: any) => void) {
    const channel = adminClient
      .channel('song-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'song_requests' },
        callback
      )
      .subscribe();

    return () => {
      adminClient.removeChannel(channel);
    };
  }
}; 