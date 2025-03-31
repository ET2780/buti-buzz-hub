
import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';

// Available interest tags
const INTEREST_TAGS = [
  'Working remotely',
  'Open to networking',
  'Creative (design/writing)',
  'Tech (coding/startups)',
  'Student/researcher'
];

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
  const [selectedTags, setSelectedTags] = useState<string[]>(user?.tags || []);
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.isAdmin === true;

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '😊');
      setSelectedTags(user.tags || []);
    }
  }, [user]);

  const handleSave = async () => {
    if (name.trim()) {
      setSaving(true);
      await updateProfile({ name, avatar, tags: selectedTags });
      setSaving(false);
      onClose();
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
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
          
          <div>
            <label className="text-sm font-medium mb-2 block">תחומי עניין</label>
            <div className="space-y-2">
              {INTEREST_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                  <Checkbox 
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => toggleTag(tag)}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">תגיות נבחרות</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                    {tag} ✕
                  </Badge>
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
