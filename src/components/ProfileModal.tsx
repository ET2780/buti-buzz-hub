
import React, { useState } from 'react';
import { LogOut, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

const EMOJIS = ['😊', '😎', '🤓', '🧠', '👾', '🤖', '👋', '🦄', '🌟', '🍕', '🍩', '☕', '🌈', '🚀'];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '😊');
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.isAdmin === true;

  const handleSave = async () => {
    if (name.trim()) {
      setSaving(true);
      await updateProfile({ name, avatar });
      setSaving(false);
      onClose();
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isAdmin ? 'פרופיל צוות BUTI' : 'הפרופיל שלך'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">שם תצוגה</label>
            <Input
              placeholder="השם שלך"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          {isAdmin ? (
            <div className="flex justify-center p-2">
              <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                <Logo size="small" />
              </div>
              <p className="mt-2 text-sm text-center text-muted-foreground">
                אווטר צוות קבוע
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">בחר/י אימוג'י לאווטר</label>
              <div className="grid grid-cols-7 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center ${
                      avatar === emoji ? 'bg-primary text-white' : 'bg-secondary'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={handleLogout} className="gap-1">
            <LogOut size={16} />
            התנתק/י
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || saving}
            className="gap-1"
          >
            <Save size={16} />
            {saving ? 'שומר...' : 'שמור פרופיל'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
