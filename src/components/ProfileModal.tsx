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
import { ButiAvatar } from './ButiAvatar';

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
  const isAdmin = user?.user_metadata?.permissions?.isAdmin === true;
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
      <DialogContent className={cn(
        "sm:max-w-[425px] rtl",
        isViewOnly && "bg-background"
      )}>
        <div className="absolute left-4 top-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogHeader className="text-right">
          <DialogTitle className={cn(
            "flex items-center gap-2 justify-end",
            isViewOnly && "text-foreground"
          )}>
            {isViewOnly ? (
              <>
                <span>פרופיל משתמש</span>
                <UserIcon className="h-5 w-5" />
              </>
            ) : (
              <>
                <span>עריכת פרופיל</span>
                <UserIcon className="h-5 w-5" />
              </>
            )}
          </DialogTitle>
          {!isViewOnly && (
            <DialogDescription className="text-right">
              ערכו את פרטי הפרופיל שלכם כאן. לחצו על שמור כאשר סיימתם.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={cn(
          "space-y-4 py-4",
          isViewOnly && "pointer-events-none"
        )}>
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-full bg-muted flex items-center justify-center",
              isViewOnly && "bg-muted"
            )}>
              {isAdmin ? (
                <>
                  <ButiAvatar user={user} />
                  {!isViewOnly && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      לוגו BUTI הוא האבטאר היחיד הזמין למנהלים
                    </p>
                  )}
                </>
              ) : (
                !isViewOnly ? (
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          avatar === emoji ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-4xl">
                    {avatar}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Name Section */}
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

          {/* Custom Status Section */}
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

          {/* Tags Section */}
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