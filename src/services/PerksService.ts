
import { supabase } from '@/integrations/supabase/client';
import { Perk } from '@/types';

// Local storage key for demo perks
const DEMO_PERKS_STORAGE_KEY = 'buti_demo_perks';

export const PerksService = {
  async getPerks(): Promise<Perk[]> {
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    // For demo mode, retrieve from localStorage
    if (!isAuthenticatedWithSupabase && localStorage.getItem('tempMockIsStaff') === 'true') {
      const storedPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
      return storedPerks ? JSON.parse(storedPerks) : [];
    }
    
    // Real Supabase implementation
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
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    // For demo mode, retrieve from localStorage
    if (!isAuthenticatedWithSupabase) {
      const storedPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
      if (storedPerks) {
        const perks = JSON.parse(storedPerks);
        return perks.filter(perk => perk.is_active);
      }
      return [];
    }
    
    // Real Supabase implementation
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
    // Check authentication status first
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticatedWithSupabase = !!sessionData.session;
    
    console.log('Creating perk:', perk);
    console.log('Authenticated with Supabase:', isAuthenticatedWithSupabase);
    
    // Try inserting the perk
    try {
      // If we're using demo login and not authenticated with Supabase
      const isAdmin = localStorage.getItem('tempMockIsStaff') === 'true';
      if (!isAuthenticatedWithSupabase && isAdmin) {
        console.log('Using demo admin access for CRUD operations');
        
        // Create a mock perk with generated ID for demo purposes
        const now = new Date().toISOString();
        const mockPerk: Perk = {
          id: crypto.randomUUID(),
          title: perk.title,
          description: perk.description,
          is_active: perk.is_active,
          created_at: now,
          updated_at: now
        };
        
        // Save to localStorage
        const existingPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
        const perks = existingPerks ? JSON.parse(existingPerks) : [];
        perks.unshift(mockPerk); // Add to beginning of array
        localStorage.setItem(DEMO_PERKS_STORAGE_KEY, JSON.stringify(perks));
        
        // Trigger a custom event to notify components that perks have been updated
        window.dispatchEvent(new Event('demo-perks-updated'));
        
        return mockPerk;
      }
      
      // Regular Supabase implementation
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
        console.log('Demo mode: Updating perk');
        
        // Update in localStorage
        const existingPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
        if (existingPerks) {
          const perks: Perk[] = JSON.parse(existingPerks);
          const updatedPerks = perks.map(perk => 
            perk.id === id 
              ? { 
                  ...perk, 
                  ...updates, 
                  updated_at: new Date().toISOString() 
                } 
              : perk
          );
          localStorage.setItem(DEMO_PERKS_STORAGE_KEY, JSON.stringify(updatedPerks));
          
          // Trigger a custom event to notify components that perks have been updated
          window.dispatchEvent(new Event('demo-perks-updated'));
        }
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
        console.log('Demo mode: Deleting perk');
        
        // Delete from localStorage
        const existingPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
        if (existingPerks) {
          const perks: Perk[] = JSON.parse(existingPerks);
          const filteredPerks = perks.filter(perk => perk.id !== id);
          localStorage.setItem(DEMO_PERKS_STORAGE_KEY, JSON.stringify(filteredPerks));
          
          // Trigger a custom event to notify components that perks have been updated
          window.dispatchEvent(new Event('demo-perks-updated'));
        }
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
        console.log('Demo mode: Toggling perk active state');
        
        // Update in localStorage
        const existingPerks = localStorage.getItem(DEMO_PERKS_STORAGE_KEY);
        if (existingPerks) {
          const perks: Perk[] = JSON.parse(existingPerks);
          const updatedPerks = perks.map(perk => 
            perk.id === id 
              ? { 
                  ...perk, 
                  is_active: isActive, 
                  updated_at: new Date().toISOString() 
                } 
              : perk
          );
          localStorage.setItem(DEMO_PERKS_STORAGE_KEY, JSON.stringify(updatedPerks));
          
          // Trigger a custom event to notify components that perks have been updated
          window.dispatchEvent(new Event('demo-perks-updated'));
        }
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
