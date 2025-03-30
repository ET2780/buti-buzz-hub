
import React from 'react';
import { MessageSquare, Music, Users } from 'lucide-react';
import Logo from './Logo';
import PerkCard from './PerkCard';
import { Button } from '@/components/ui/button';
import ButiAvatar from './ButiAvatar';

interface SidebarProps {
  onOpenSongModal: () => void;
  onOpenProfileModal: () => void;
  activeUsersCount?: number;
  profile?: {
    name: string;
    avatar: string;
    isAdmin?: boolean;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onOpenSongModal, 
  onOpenProfileModal, 
  activeUsersCount = 0,
  profile = { name: 'Guest', avatar: '😊' }
}) => {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Logo size="medium" />
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <MessageSquare size={16} />
          <span>BUTI Chat</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Users size={14} />
          <span>{activeUsersCount} users online</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <PerkCard 
          title="Today's Perk" 
          description="Buy 1 coffee, get a cookie free! ☕🍪" 
        />
        
        <Button 
          onClick={onOpenSongModal} 
          className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
        >
          <Music size={16} />
          <span>Suggest a Song</span>
        </Button>
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
          <span>{profile.isAdmin ? 'BUTI Staff' : profile.name}</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
