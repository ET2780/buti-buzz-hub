import React, { useState, useEffect } from 'react';
import { MessageSquare, Music, Users, Gift, Settings, ListMusic, LogOut } from 'lucide-react';
import Logo from './Logo';
import PerkCard from './PerkCard';
import { Button } from '@/components/ui/button';
import ButiAvatar from './ButiAvatar';
import { Perk } from '@/types';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import ProfileModal from './ProfileModal';
import SongRequestModal from './modals/SongRequestModal';
import { PerksManagementModal } from './modals/PerksManagementModal';
import PinnedMessageManager from './modals/PinnedMessageManager';
import ManageUsersModal from './modals/ManageUsersModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import PinnedMessageCard from './PinnedMessageCard';
import { PinnedMessage } from '@/types';

interface SidebarProps {
  activeUsersCount: number;
  activePerks?: Perk[];
  isLoadingPerks?: boolean;
  onOpenSongRequest?: () => void;
  onOpenSongRequestManager?: () => void;
  isAdmin?: boolean;
  pinnedMessages: PinnedMessage[] | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeUsersCount,
  activePerks = [],
  isLoadingPerks = false,
  onOpenSongRequest,
  onOpenSongRequestManager,
  isAdmin = false,
  pinnedMessages,
}) => {
  const navigate = useNavigate();
  const { user: initialUser, signOut, resetAdminCredentials } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser);
  const [currentPerkIndex, setCurrentPerkIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPerks, setShowPerks] = useState(false);
  const [showSongRequest, setShowSongRequest] = useState(false);
  const [showPinnedMessage, setShowPinnedMessage] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);

  // Debug initial user data
  useEffect(() => {
    console.log('Initial user data in Sidebar:', initialUser);
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent<{user: User}>) => {
      console.log('Profile updated event received in Sidebar:', event.detail);
      if (event.detail?.user) {
        console.log('Updating user in Sidebar with:', event.detail.user);
        setUser(event.detail.user);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);

  // Debug current user state
  useEffect(() => {
    console.log('Current user state in Sidebar:', user);
  }, [user]);

  const nextPerk = () => {
    if (activePerks.length > 0) {
      setCurrentPerkIndex((currentPerkIndex + 1) % activePerks.length);
    }
  };

  const handleManagePerks = async () => {
    if (!user?.user_metadata?.permissions?.canManagePerks) return;
    setIsLoading(true);
    try {
      // TODO: Implement perk management
      toast.success('ניהול הפרקים עודכן בהצלחה');
    } catch (error) {
      toast.error('שגיאה בניהול הפרקים');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageUsers = async () => {
    if (!user?.user_metadata?.permissions?.canManageUsers) return;
    setIsLoading(true);
    try {
      // TODO: Implement user management
      toast.success('ניהול המשתמשים עודכן בהצלחה');
    } catch (error) {
      toast.error('שגיאה בניהול המשתמשים');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinMessage = async () => {
    if (!user?.user_metadata?.permissions?.canManagePinnedMessages) return;
    setIsLoading(true);
    try {
      // TODO: Implement message pinning
      toast.success('ההודעה נצמדה בהצלחה');
    } catch (error) {
      toast.error('שגיאה בצמידת ההודעה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongRequest = async () => {
    if (!user?.user_metadata?.permissions?.canSuggestSongs) return;
    setIsLoading(true);
    try {
      // TODO: Implement song request
      toast.success('בקשת השיר נשלחה בהצלחה');
    } catch (error) {
      toast.error('שגיאה בשליחת בקשת השיר');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await signOut();
    navigate('/');
  };

  const handleResetAdmin = async () => {
    await resetAdminCredentials();
  };

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col" dir="rtl">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="medium" />
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <MessageSquare size={16} />
          <span>צ'אט BUTI</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Users size={14} />
          <span>{activeUsersCount} משתמשים מחוברים</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow space-y-4">
        {isLoadingPerks ? (
          <div className="p-4 border rounded-md text-center text-muted-foreground animate-pulse">
            טוען הטבות...
          </div>
        ) : activePerks.length > 0 ? (
          <div>
            <PerkCard 
              title={activePerks[currentPerkIndex].title} 
              description={activePerks[currentPerkIndex].description} 
            />
            {activePerks.length > 1 && (
              <Button
                onClick={nextPerk} 
                variant="ghost"
                size="sm" 
                className="w-full mt-2"
              >
                הטבה הבאה ←
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 border rounded-md text-center text-muted-foreground">
            אין הטבות פעילות כרגע
          </div>
        )}

        {/* Profile Button - Always visible */}
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowProfile(true)}
        >
          {isAdmin ? (
            <img 
              src="/buti-logo.png" 
              alt="Admin Avatar" 
              className="ml-2 w-6 h-6 object-contain"
            />
          ) : (
            <span role="img" aria-label="User Avatar" className="ml-2">
              {user?.user_metadata?.avatar || '😊'}
            </span>
          )}
          <span className="truncate">
            {user?.user_metadata?.name || 'אורח'}
          </span>
        </Button>

        {/* Song Request Button - Different behavior for admins */}
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={isAdmin ? onOpenSongRequestManager : onOpenSongRequest}
        >
          <Music size={16} className="ml-2" />
          {isAdmin ? 'ניהול בקשות שירים' : 'בקשת שיר'}
        </Button>

        {/* Admin Only Buttons */}
        {user?.user_metadata?.permissions?.canManagePerks && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowPerks(true)}
          >
            <Gift className="ml-2" />
            ניהול הטבות
          </Button>
        )}

        {user?.user_metadata?.permissions?.canManageUsers && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowManageUsers(true)}
          >
            <Users className="ml-2" />
            ניהול משתמשים
          </Button>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetAdmin}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {showPerks && (
        <PerksManagementModal
          isOpen={showPerks}
          onClose={() => setShowPerks(false)}
        />
      )}

      {showSongRequest && (
        <SongRequestModal
          isOpen={showSongRequest}
          onClose={() => setShowSongRequest(false)}
          isAdmin={user?.user_metadata?.permissions?.canManageSongs}
        />
      )}

      {showPinnedMessage && (
        <PinnedMessageManager
          isOpen={showPinnedMessage}
          onClose={() => setShowPinnedMessage(false)}
        />
      )}

      {showManageUsers && (
        <ManageUsersModal
          isOpen={showManageUsers}
          onClose={() => setShowManageUsers(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
