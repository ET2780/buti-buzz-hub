
import React, { useState, useEffect } from 'react';
import { MessageSquare, Music, Users, Gift, Settings } from 'lucide-react';
import Logo from './Logo';
import PerkCard from './PerkCard';
import { Button } from '@/components/ui/button';
import ButiAvatar from './ButiAvatar';
import { Perk, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { PerksService } from '@/services/PerksService';

interface SidebarProps {
  onOpenSongModal: () => void;
  onOpenProfileModal: () => void;
  onOpenPerksModal?: () => void;
  activeUsersCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenSongModal, 
  onOpenProfileModal,
  onOpenPerksModal,
  activeUsersCount = 0
}) => {
  const { user, isAdmin } = useAuth();
  const [activePerk, setActivePerk] = useState<Perk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivePerks();
  }, []);

  const fetchActivePerks = async () => {
    try {
      setIsLoading(true);
      const perks = await PerksService.getActivePerks();
      setActivePerk(perks.length > 0 ? perks[0] : null);
    } catch (error) {
      console.error('Failed to fetch active perks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
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
      
      <div className="p-4 flex-grow">
        {isLoading ? (
          <div className="p-4 border rounded-md text-center text-muted-foreground animate-pulse">
            טוען הטבות...
          </div>
        ) : activePerk ? (
          <PerkCard 
            title={activePerk.title} 
            description={activePerk.description} 
          />
        ) : (
          <div className="p-4 border rounded-md text-center text-muted-foreground">
            אין הטבות פעילות כרגע
          </div>
        )}
        
        <Button 
          onClick={onOpenSongModal} 
          className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
        >
          <Music size={16} />
          <span>הצע/י שיר</span>
        </Button>
        
        {isAdmin && onOpenPerksModal && (
          <Button 
            onClick={onOpenPerksModal} 
            className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
          >
            <Gift size={16} />
            <span>ניהול הטבות</span>
          </Button>
        )}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={onOpenProfileModal} 
          className="w-full flex items-center justify-start gap-2"
        >
          <ButiAvatar 
            avatar={user?.avatar} 
            name={user?.name || ''} 
            isAdmin={user?.isAdmin}
            size="sm"
          />
          <span>{user?.isAdmin ? 'צוות BUTI' : user?.name}</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
