
import React, { useState } from 'react';
import { Perk } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PerksManagementProps {
  isOpen: boolean;
  onClose: () => void;
  perks: Perk[];
  onUpdatePerks: (perks: Perk[]) => void;
}

const PerksManagement: React.FC<PerksManagementProps> = ({
  isOpen,
  onClose,
  perks,
  onUpdatePerks,
}) => {
  const [localPerks, setLocalPerks] = useState<Perk[]>(perks);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newPerk, setNewPerk] = useState<Partial<Perk>>({
    title: '',
    description: '',
  });

  const handleAddPerk = () => {
    if (!newPerk.title || !newPerk.description) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    const perk: Perk = {
      id: uuidv4(),
      title: newPerk.title,
      description: newPerk.description,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLocalPerks([...localPerks, perk]);
    setNewPerk({ title: '', description: '' });
    toast.success('ההטבה נוספה בהצלחה');
  };

  const handleUpdatePerk = (id: string, field: keyof Perk, value: any) => {
    setLocalPerks(
      localPerks.map((perk) =>
        perk.id === id
          ? { ...perk, [field]: value, updatedAt: new Date() }
          : perk
      )
    );
  };

  const handleToggleActive = (id: string) => {
    setLocalPerks(
      localPerks.map((perk) =>
        perk.id === id
          ? { ...perk, isActive: !perk.isActive, updatedAt: new Date() }
          : perk
      )
    );
  };

  const handleDeletePerk = (id: string) => {
    setLocalPerks(localPerks.filter((perk) => perk.id !== id));
    toast.success('ההטבה נמחקה בהצלחה');
  };

  const handleSave = () => {
    onUpdatePerks(localPerks);
    onClose();
    toast.success('ההטבות נשמרו בהצלחה');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              />
              <Textarea
                placeholder="תיאור ההטבה"
                value={newPerk.description}
                onChange={(e) =>
                  setNewPerk({ ...newPerk, description: e.target.value })
                }
              />
              <Button
                onClick={handleAddPerk}
                className="w-full flex items-center gap-2"
              >
                <Plus size={16} />
                הוסף הטבה
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">הטבות נוכחיות</h3>
            {localPerks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין הטבות. הוסף הטבה חדשה למעלה.
              </p>
            ) : (
              localPerks.map((perk) => (
                <div
                  key={perk.id}
                  className={`p-3 border rounded-md ${
                    perk.isActive ? 'border-primary' : 'border-muted opacity-60'
                  }`}
                >
                  {isEditing === perk.id ? (
                    <div className="space-y-2">
                      <Input
                        value={perk.title}
                        onChange={(e) =>
                          handleUpdatePerk(perk.id, 'title', e.target.value)
                        }
                      />
                      <Textarea
                        value={perk.description}
                        onChange={(e) =>
                          handleUpdatePerk(
                            perk.id,
                            'description',
                            e.target.value
                          )
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(null)}
                        >
                          <X size={16} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(null)}
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
                          >
                            עריכה
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(perk.id)}
                          >
                            {perk.isActive ? 'בטל הצגה' : 'הצג'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeletePerk(perk.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {perk.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {perk.isActive ? 'פעיל' : 'לא פעיל'} • עודכן:{' '}
                        {new Date(perk.updatedAt).toLocaleDateString('he-IL')}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSave}>שמור שינויים</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PerksManagement;
