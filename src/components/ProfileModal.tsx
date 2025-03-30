
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

const EMOJIS = ['😊', '😎', '🤓', '🧠', '👾', '🤖', '👋', '🦄', '🌟', '🍕', '🍩', '☕', '🌈', '🚀'];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    avatar: string;
    isAdmin?: boolean;
  };
  onUpdateProfile: (profile: { name: string; avatar: string; isAdmin?: boolean }) => void;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);
  const isAdmin = profile.isAdmin === true;

  const handleSave = () => {
    if (name.trim()) {
      setSaving(true);
      // Simulate API request
      setTimeout(() => {
        onUpdateProfile({ 
          name, 
          avatar, 
          isAdmin: profile.isAdmin // Preserve admin status
        });
        setSaving(false);
        onClose();
      }, 800);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isAdmin ? 'BUTI Staff Profile' : 'Your Profile'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <Input
              placeholder="Your name"
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
                Staff avatar is fixed
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-2 block">Choose an Emoji Avatar</label>
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
          <Button variant="outline" onClick={onLogout} className="gap-1">
            <LogOut size={16} />
            Logout
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || saving}
            className="gap-1"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
