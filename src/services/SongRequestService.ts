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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const SongRequestService = {
  async createSongRequest(request: Omit<SongRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<SongRequest> {
    try {
      console.log('Creating song request:', request);

      // First, check if the profile exists
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', request.user_id)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create the song request
      const { data, error } = await adminClient
        .from('song_requests')
        .insert([
          {
            user_id: request.user_id,
            song_name: request.song_name,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating song request:', error);
        throw error;
      }
      console.log('Song request created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createSongRequest:', error);
      throw error;
    }
  },

  async getRecentRequests(): Promise<SongRequest[]> {
    try {
      console.log('Fetching recent song requests...');
      const { data, error } = await adminClient
        .from('song_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching song requests:', error);
        throw error;
      }

      console.log('Song requests:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getRecentRequests:', error);
      throw error;
    }
  },

  async approveSongRequest(id: string): Promise<void> {
    try {
      console.log('Approving song request:', id);
      
      // First get the song request details
      const { data: songRequest, error: fetchError } = await adminClient
        .from('song_requests')
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching song request:', fetchError);
        throw fetchError;
      }

      if (!songRequest) {
        throw new Error('Song request not found');
      }

      // Update the song request status
      const { error: updateError } = await adminClient
        .from('song_requests')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error approving song request:', updateError);
        throw updateError;
      }

      // Get or create admin ID
      let adminId = localStorage.getItem('buti_admin_id');
      if (!adminId && localStorage.getItem('buti_admin') === 'true') {
        // Generate a new admin ID and store it
        adminId = crypto.randomUUID();
        localStorage.setItem('buti_admin_id', adminId);

        // Create admin profile in the database
        const { error: profileError } = await adminClient
          .from('profiles')
          .upsert({
            id: adminId,
            name: 'Buti Staff',
            avatar: '/buti-logo.png',
            tags: ['admin'],
            custom_status: 'צוות BUTI'
          });

        if (profileError) {
          console.error('Error creating admin profile:', profileError);
        }
      }

      if (!adminId) {
        console.error('No admin ID found in localStorage');
        return;
      }

      // Create an admin message about the approved song with RTL support
      const { error: messageError } = await adminClient
        .from('messages')
        .insert([
          {
            sender_id: adminId,
            text: `\u200F🎵 "${songRequest.song_name}" - ${songRequest.profiles.name} ביקש את השיר הזה!`,
            created_at: new Date().toISOString()
          }
        ]);

      if (messageError) {
        console.error('Error creating admin message:', messageError);
        // Don't throw the error here as the song request was already approved
      }

      console.log('Song request approved successfully');
    } catch (error) {
      console.error('Error in approveSongRequest:', error);
      throw error;
    }
  },

  async rejectSongRequest(id: string): Promise<void> {
    try {
      console.log('Rejecting song request:', id);
      const { error } = await adminClient
        .from('song_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error rejecting song request:', error);
        throw error;
      }
      console.log('Song request rejected successfully');
    } catch (error) {
      console.error('Error in rejectSongRequest:', error);
      throw error;
    }
  },

  async deleteSongRequest(id: string): Promise<void> {
    try {
      console.log('Deleting song request:', id);
      const { error } = await adminClient
        .from('song_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting song request:', error);
        throw error;
      }
      console.log('Song request deleted successfully');
    } catch (error) {
      console.error('Error in deleteSongRequest:', error);
      throw error;
    }
  },

  async clearOldRequests(): Promise<void> {
    try {
      console.log('Clearing old song requests...');
      const { error } = await adminClient
        .from('song_requests')
        .delete()
        .lt('created_at', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error('Error clearing old song requests:', error);
        throw error;
      }
      console.log('Old song requests cleared successfully');
    } catch (error) {
      console.error('Error in clearOldRequests:', error);
      throw error;
    }
  },

  subscribeToSongRequests(callback: (payload: any) => void) {
    console.log('Setting up song requests subscription...');
    const channel = adminClient
      .channel('song-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'song_requests' },
        (payload) => {
          console.log('Song request change detected:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from song requests...');
      adminClient.removeChannel(channel);
    };
  }
}; 