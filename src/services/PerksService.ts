import { adminClient } from '@/integrations/supabase/client';
import { Perk } from '@/types';

// Table name for perks
const PERKS_TABLE = 'perks';

export const PerksService = {
  async getPerks(): Promise<Perk[]> {
    const { data, error } = await adminClient
      .from(PERKS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching perks:', error);
      throw error;
    }

    return data || [];
  },

  async getActivePerks(): Promise<Perk[]> {
    const { data, error } = await adminClient
      .from(PERKS_TABLE)
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
    try {
      const { data, error } = await adminClient
        .from(PERKS_TABLE)
        .insert([
          {
            title: perk.title,
            description: perk.description,
            is_active: perk.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
    try {
      const { error } = await adminClient
        .from(PERKS_TABLE)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating perk:', error);
      throw error;
    }
  },

  async deletePerk(id: string): Promise<void> {
    try {
      const { error } = await adminClient
        .from(PERKS_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting perk:', error);
      throw error;
    }
  },

  async togglePerkActive(id: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await adminClient
        .from(PERKS_TABLE)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error toggling perk active status:', error);
      throw error;
    }
  }
};
