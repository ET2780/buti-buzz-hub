import React, { useState, useEffect } from 'react';
import { LogOut, Save, User as UserIcon, Plus, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Available interest tags in Hebrew
const INTEREST_TAGS = [
  'עובד/ת מרחוק',
  'פתוח/ה לנטוורקינג',
  'יצירתי/ת (עיצוב/כתיבה)',
  'טכנולוגי/ת (קוד/סטארטאפים)',
  'סטודנט/ית או חוקר/ת'
];

const EMOJIS = ['😊', '😎', '🤓', '🧠', '👾', '🤖', '👋', '🦄', '🌟', '🍕', '🍩', '☕', '🌈', '🚀'];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null; // Optional user prop for viewing other users' profiles
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user: propUser }) => {
  const { user: authUser, updateProfile, signOut } = useAuth();
  const user = propUser || authUser; // Use prop user if provided, otherwise use auth user
  
  const [username, setUsername] = useState(user?.user_metadata?.name || '');
  const [avatar, setAvatar] = useState(user?.user_metadata?.avatar || '😊');
  const [selectedTags, setSelectedTags] = useState<string[]>(user?.user_metadata?.tags || []);
  const [customStatus, setCustomStatus] = useState(user?.user_metadata?.customStatus || '');
  const [customTag, setCustomTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = user?.user_metadata?.isAdmin === true;
  const isViewOnly = !!propUser; // If propUser is provided, it's view-only mode

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.name || '');
      setAvatar(user.user_metadata?.avatar || '😊');
      setSelectedTags(user.user_metadata?.tags || []);
      setCustomStatus(user.user_metadata?.customStatus || '');
    }
  }, [user]);

  // Listen for real-time profile updates
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent<{user: User}>) => {
      const updatedUser = event.detail?.user;
      if (!updatedUser) return;

      // Only update if this is the user we're displaying
      if (updatedUser.id === user?.id) {
        setUsername(updatedUser.user_metadata?.name || '');
        setAvatar(updatedUser.user_metadata?.avatar || '😊');
        setSelectedTags(updatedUser.user_metadata?.tags || []);
        setCustomStatus(updatedUser.user_metadata?.customStatus || '');
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!authUser) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        name: username.trim(),
        avatar,
        tags: selectedTags,
        customStatus: customStatus.trim() || undefined
      };

      const updatedUser = await updateProfile(updatedProfile);
      
      // Dispatch a custom event to notify other components about the profile update
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { user: updatedUser }
      }));

      toast.success('הפרופיל עודכן בהצלחה');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('שגיאה בעדכון הפרופיל');
    } finally {
      setIsLoading(false);
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

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800" aria-describedby="profile-description">
        <DialogHeader>
          <DialogTitle>פרופיל משתמש</DialogTitle>
          <DialogDescription id="profile-description">
            {isViewOnly ? 'צפייה בפרופיל המשתמש' : 'עריכת פרטי הפרופיל'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            {isAdmin ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-primary flex items-center justify-center">
                  <img
                    src={user?.user_metadata?.avatar || '/buti-logo.png'}
                    alt="Admin Avatar"
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex items-center justify-center text-lg';
                      fallback.textContent = 'Admin';
                      target.parentNode?.appendChild(fallback);
                    }}
                  />
                </div>
                {!isViewOnly && (
                  <p className="text-sm text-gray-500 text-center">
                    The buti logo is the only available avatar for admins
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                {!isViewOnly ? (
                  <div className="grid grid-cols-4 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          avatar === emoji
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-white border-2 border-primary">
                    {user?.user_metadata?.avatar || avatar}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium text-right block",
              isViewOnly && "text-foreground"
            )}>
              שם
            </Label>
            {isViewOnly ? (
              <div className="text-lg font-medium p-2 bg-muted rounded-md text-right">
                {username}
              </div>
            ) : (
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הזינו את שמכם"
                className="text-right"
                dir="rtl"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium text-right block",
              isViewOnly && "text-foreground"
            )}>
              סטטוס אישי
            </Label>
            {isViewOnly ? (
              <div className="text-lg p-2 bg-muted rounded-md text-right">
                {customStatus || 'לא הוגדר סטטוס אישי'}
              </div>
            ) : (
              <Input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="הזינו סטטוס אישי"
                className="text-right"
                dir="rtl"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className={cn(
              "text-sm font-medium text-right block",
              isViewOnly && "text-foreground"
            )}>
              תגיות
            </Label>
            {isViewOnly ? (
              <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md justify-end">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">אין תגיות</span>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    >
                      {tag} <X className="h-3 w-3 mr-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (customTag && !selectedTags.includes(customTag)) {
                        setSelectedTags([...selectedTags, customTag]);
                        setCustomTag('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="הוסיפו תגית חדשה"
                    className="text-right"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {INTEREST_TAGS.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <Label htmlFor={tag} className="text-sm cursor-pointer">
                        {tag}
                      </Label>
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className={cn(
          "flex gap-2",
          isViewOnly && "justify-center"
        )}>
          {isViewOnly ? (
            <Button variant="outline" onClick={onClose}>
              סגור
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>שמור</span>
                    <Save className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;