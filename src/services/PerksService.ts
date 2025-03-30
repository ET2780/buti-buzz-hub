
import { supabase } from '@/integrations/supabase/client';
import { Perk } from '@/types';

export const PerksService = {
  async getPerks(): Promise<Perk[]> {
    const { data, error } = await supabase
      .from('perks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching perks:', error);
      throw error;
    }

    return data || [];
  },

  async getActivePerks(): Promise<Perk[]> {
    const { data, error } = await supabase
      .from('perks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching active perks:', error);
      throw error;
    }

    return data || [];
  },

  async createPerk(perk: Omit<Perk, 'id' | 'created_at' | 'updated_at'>): Promise<Perk> {
    // Attempt to create using the Supabase client directly - this will work if the user is authenticated
    // and has the proper permissions via RLS policies
    console.log('Creating perk:', perk);
    
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    console.log('Authenticated with Supabase:', isAuthenticatedWithSupabase);
    
    // Try inserting the perk
    try {
      const { data, error } = await supabase
        .from('perks')
        .insert([
          {
            title: perk.title,
            description: perk.description,
            is_active: perk.is_active
          }
        ])
        .select()
        .single();
      
      if (error) {
        // If we're using demo login and not authenticated with Supabase, special handling
        const isAdmin = localStorage.getItem('tempMockIsStaff') === 'true';
        if (!isAuthenticatedWithSupabase && isAdmin) {
          console.log('Using demo admin access for CRUD operations');
          // Create a mock perk with generated ID for demo purposes
          const mockPerk: Perk = {
            id: crypto.randomUUID(),
            title: perk.title,
            description: perk.description,
            is_active: perk.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return mockPerk;
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating perk:', error);
      throw error;
    }
  },

  async updatePerk(id: string, updates: Partial<Perk>): Promise<void> {
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    if (!isAuthenticatedWithSupabase) {
      // For demo mode
      const isAdmin = localStorage.getItem('tempMockIsStaff') === 'true';
      if (isAdmin) {
        console.log('Demo mode: Simulating perk update');
        return;
      }
      throw new Error('Authentication required');
    }
    
    const { error } = await supabase
      .from('perks')
      .update({
        title: updates.title,
        description: updates.description,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating perk:', error);
      throw error;
    }
  },

  async deletePerk(id: string): Promise<void> {
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    if (!isAuthenticatedWithSupabase) {
      // For demo mode
      const isAdmin = localStorage.getItem('tempMockIsStaff') === 'true';
      if (isAdmin) {
        console.log('Demo mode: Simulating perk deletion');
        return;
      }
      throw new Error('Authentication required');
    }
    
    const { error } = await supabase
      .from('perks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting perk:', error);
      throw error;
    }
  },

  async togglePerkActive(id: string, isActive: boolean): Promise<void> {
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    if (!isAuthenticatedWithSupabase) {
      // For demo mode
      const isAdmin = localStorage.getItem('tempMockIsStaff') === 'true';
      if (isAdmin) {
        console.log('Demo mode: Simulating perk toggle');
        return;
      }
      throw new Error('Authentication required');
    }
    
    const { error } = await supabase
      .from('perks')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error toggling perk active state:', error);
      throw error;
    }
  }
};
