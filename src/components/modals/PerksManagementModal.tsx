import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

// Create admin client with service role key
const adminClient = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface Perk {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PerksManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerksManagementModal({ isOpen, onClose }: PerksManagementModalProps) {
  const { user } = useAuth();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPerk, setCurrentPerk] = useState<Perk | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen && user?.user_metadata?.isAdmin) {
      fetchPerks();
    }
  }, [isOpen, user]);

  const fetchPerks = async () => {
    try {
      const { data, error } = await adminClient
        .from('perks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPerks(data || []);
    } catch (error) {
      console.error('Error fetching perks:', error);
      toast.error('שגיאה בטעינת המבצעים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerk = () => {
    setIsEditing(true);
    setCurrentPerk(null);
    setTitle('');
    setDescription('');
  };

  const handleEditPerk = (perk: Perk) => {
    setIsEditing(true);
    setCurrentPerk(perk);
    setTitle(perk.title);
    setDescription(perk.description);
  };

  const handleDeletePerk = async (id: string) => {
    try {
      const { error } = await adminClient
        .from('perks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPerks(perks.filter(perk => perk.id !== id));
      toast.success('המבצע נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting perk:', error);
      toast.error('שגיאה במחיקת המבצע');
    }
  };

  const handleSavePerk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    try {
      if (currentPerk) {
        // Update existing perk
        const { error } = await adminClient
          .from('perks')
          .update({
            title,
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPerk.id);

        if (error) throw error;
        setPerks(perks.map(p => p.id === currentPerk.id ? { ...p, title, description } : p));
        toast.success('המבצע עודכן בהצלחה');
      } else {
        // Create new perk
        const { data, error } = await adminClient
          .from('perks')
          .insert({
            title,
            description,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        setPerks([data, ...perks]);
        toast.success('המבצע נוצר בהצלחה');
      }

      setIsEditing(false);
      setCurrentPerk(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error saving perk:', error);
      toast.error('שגיאה בשמירת המבצע');
    }
  };

  const handleToggleActive = async (perk: Perk) => {
    try {
      const { error } = await adminClient
        .from('perks')
        .update({ 
          is_active: !perk.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', perk.id);

      if (error) throw error;
      setPerks(perks.map(p => p.id === perk.id ? { ...p, is_active: !p.is_active } : p));
      toast.success(`המבצע ${!perk.is_active ? 'הופעל' : 'הושבת'} בהצלחה`);
    } catch (error) {
      console.error('Error toggling perk status:', error);
      toast.error('שגיאה בשינוי סטטוס המבצע');
    }
  };

  if (!user?.user_metadata?.isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rtl">
        <DialogHeader>
          <DialogTitle className="text-right">ניהול הטבות</DialogTitle>
          <DialogDescription className="text-right">
            כאן תוכלו לנהל את ההטבות המוצגות למשתמשים
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSavePerk} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-right">כותרת</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="הזן כותרת למבצע"
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-right">תיאור</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="הזן תיאור למבצע"
                required
                className="min-h-[100px] text-right"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPerk(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                ביטול
              </Button>
              <Button type="submit">
                {currentPerk ? 'עדכן' : 'צור'} מבצע
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleAddPerk}
              className="w-full"
            >
              <Plus className="h-4 w-4 ml-2" />
              הוסף מבצע חדש
            </Button>

            <div className="space-y-4">
              {perks.map((perk) => (
                <Card key={perk.id} className="border-buti-sand bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {perk.title}
                        <span className="text-buti-blue">🎁</span>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPerk(perk)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePerk(perk.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(perk)}
                          className={perk.is_active ? 'text-green-500' : 'text-red-500'}
                        >
                          {perk.is_active ? '✓' : '✕'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{perk.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 