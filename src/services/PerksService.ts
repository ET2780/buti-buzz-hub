
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
      console.error('Error creating perk:', error);
      throw error;
    }

    return data;
  },

  async updatePerk(id: string, updates: Partial<Perk>): Promise<void> {
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
