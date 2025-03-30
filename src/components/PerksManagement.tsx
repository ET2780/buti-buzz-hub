
import React, { useState, useEffect } from 'react';
import { Perk } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PerksService } from '@/services/PerksService';
import { useAuth } from '@/context/AuthContext';

interface PerksManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onPerksUpdated: () => void;
}

const PerksManagement: React.FC<PerksManagementProps> = ({
  isOpen,
  onClose,
  onPerksUpdated
}) => {
  const { isAdmin } = useAuth();
  const [perks, setPerks] = useState<Perk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newPerk, setNewPerk] = useState<Partial<Perk>>({
    title: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      loadPerks();
    }
  }, [isOpen]);

  const loadPerks = async () => {
    try {
      setIsLoading(true);
      const fetchedPerks = await PerksService.getPerks();
      setPerks(fetchedPerks);
    } catch (error) {
      console.error('Failed to load perks:', error);
      toast.error('Failed to load perks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerk = async () => {
    if (!newPerk.title || !newPerk.description) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdPerk = await PerksService.createPerk({
        title: newPerk.title,
        description: newPerk.description,
        is_active: true
      });
      
      setPerks([createdPerk, ...perks]);
      setNewPerk({ title: '', description: '', is_active: true });
      toast.success('ההטבה נוספה בהצלחה');
    } catch (error) {
      console.error('Failed to add perk:', error);
      toast.error('Failed to add perk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePerk = (id: string, field: keyof Perk, value: any) => {
    setPerks(
      perks.map((perk) =>
        perk.id === id ? { ...perk, [field]: value } : perk
      )
    );
  };

  const handleSaveEdit = async (id: string) => {
    const perkToUpdate = perks.find(perk => perk.id === id);
    if (!perkToUpdate) return;

    try {
      setIsSubmitting(true);
      await PerksService.updatePerk(id, {
        title: perkToUpdate.title,
        description: perkToUpdate.description,
        is_active: perkToUpdate.is_active
      });
      
      setIsEditing(null);
      toast.success('ההטבה עודכנה בהצלחה');
    } catch (error) {
      console.error('Failed to update perk:', error);
      toast.error('Failed to update perk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      setIsSubmitting(true);
      await PerksService.togglePerkActive(id, !currentState);
      
      setPerks(
        perks.map((perk) =>
          perk.id === id ? { ...perk, is_active: !currentState } : perk
        )
      );
      
      toast.success(currentState ? 'ההטבה הושבתה' : 'ההטבה הופעלה');
    } catch (error) {
      console.error('Failed to toggle perk state:', error);
      toast.error('Failed to update perk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePerk = async (id: string) => {
    if (!confirm('האם את/ה בטוח/ה שברצונך למחוק את ההטבה?')) return;
    
    try {
      setIsSubmitting(true);
      await PerksService.deletePerk(id);
      
      setPerks(perks.filter((perk) => perk.id !== id));
      toast.success('ההטבה נמחקה בהצלחה');
    } catch (error) {
      console.error('Failed to delete perk:', error);
      toast.error('Failed to delete perk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onPerksUpdated();
    onClose();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ניהול הטבות היום
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-sm font-medium">הוספת הטבה חדשה</h3>
            <div className="space-y-2">
              <Input
                placeholder="כותרת ההטבה"
                value={newPerk.title}
                onChange={(e) => setNewPerk({ ...newPerk, title: e.target.value })}
                disabled={isSubmitting}
              />
              <Textarea
                placeholder="תיאור ההטבה"
                value={newPerk.description}
                onChange={(e) =>
                  setNewPerk({ ...newPerk, description: e.target.value })
                }
                disabled={isSubmitting}
              />
              <Button
                onClick={handleAddPerk}
                className="w-full flex items-center gap-2"
                disabled={isSubmitting || !newPerk.title || !newPerk.description}
              >
                <Plus size={16} />
                הוסף הטבה
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">הטבות נוכחיות</h3>
            
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                טוען הטבות...
              </p>
            ) : perks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין הטבות. הוסף הטבה חדשה למעלה.
              </p>
            ) : (
              perks.map((perk) => (
                <div
                  key={perk.id}
                  className={`p-3 border rounded-md ${
                    perk.is_active ? 'border-primary' : 'border-muted opacity-60'
                  }`}
                >
                  {isEditing === perk.id ? (
                    <div className="space-y-2">
                      <Input
                        value={perk.title}
                        onChange={(e) =>
                          handleUpdatePerk(perk.id, 'title', e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                      <Textarea
                        value={perk.description}
                        onChange={(e) =>
                          handleUpdatePerk(perk.id, 'description', e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(null)}
                          disabled={isSubmitting}
                        >
                          <X size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(perk.id)}
                          disabled={isSubmitting}
                        >
                          <Save size={16} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <h4 className="font-medium">{perk.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(perk.id)}
                            disabled={isSubmitting}
                          >
                            עריכה
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(perk.id, perk.is_active)}
                            disabled={isSubmitting}
                          >
                            {perk.is_active ? 'בטל הצגה' : 'הצג'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeletePerk(perk.id)}
                            disabled={isSubmitting}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {perk.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {perk.is_active ? 'פעיל' : 'לא פעיל'} • עודכן:{' '}
                        {new Date(perk.updated_at).toLocaleDateString('he-IL')}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PerksManagement;
