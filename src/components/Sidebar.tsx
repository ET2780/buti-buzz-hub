
import React from 'react';
import { MessageSquare, Music, Users, Gift, Settings } from 'lucide-react';
import Logo from './Logo';
import PerkCard from './PerkCard';
import { Button } from '@/components/ui/button';
import ButiAvatar from './ButiAvatar';
import { Perk, User } from '@/types';

interface SidebarProps {
  onOpenSongModal: () => void;
  onOpenProfileModal: () => void;
  onOpenPerksModal?: () => void;
  activeUsersCount?: number;
  profile?: User;
  activePerk?: Perk;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenSongModal, 
  onOpenProfileModal,
  onOpenPerksModal,
  activeUsersCount = 0,
  profile = { name: 'אורח', avatar: '😊' },
  activePerk
}) => {
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
        {activePerk ? (
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
        
        {profile.isAdmin && onOpenPerksModal && (
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
            avatar={profile.avatar} 
            name={profile.name} 
            isAdmin={profile.isAdmin}
            size="sm"
          />
          <span>{profile.isAdmin ? 'צוות BUTI' : profile.name}</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
