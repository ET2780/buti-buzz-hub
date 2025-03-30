
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import { User, Message, Perk } from '@/types';
import SongSuggestionModal from '@/components/SongSuggestionModal';
import ProfileModal from '@/components/ProfileModal';
import PerksManagement from '@/components/PerksManagement';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { PerksService } from '@/services/PerksService';
import { toast } from '@/components/ui/use-toast';

const ChatPage = () => {
  const { user, isAdmin } = useAuth();
  const [showSongModal, setShowSongModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPerksModal, setShowPerksModal] = useState(false);
  
  // Demo messages
  const initialMessages: Message[] = [
    {
      id: "1",
      sender: { name: "אודי", avatar: "🧑", isAdmin: true },
      text: "ברוכים הבאים לצ'אט של קפה BUTI! מי מגיע היום?",
      timestamp: new Date(Date.now() - 60 * 60000),
      isCurrentUser: false
    },
    {
      id: "2",
      sender: { name: "דנה", avatar: "👩" },
      text: "אני אהיה שם בסביבות 14:00, מישהו מצטרף?",
      timestamp: new Date(Date.now() - 45 * 60000),
      isCurrentUser: false
    }
  ];
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeUsers, setActiveUsers] = useState(4);

  const handlePerksUpdated = async () => {
    // This would re-fetch perks for the sidebar
  };

  const handleSongSubmit = (songName: string) => {
    toast({
      title: "תודה על ההצעה!",
      description: `השיר "${songName}" נשלח לצוות BUTI`,
    });
  };

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar 
          onOpenSongModal={() => setShowSongModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onOpenPerksModal={isAdmin ? () => setShowPerksModal(true) : undefined}
          activeUsersCount={activeUsers}
        />
        
        <div className="flex-1 flex flex-col">
          <ChatFeed 
            messages={messages}
            onSendMessage={(text) => {
              if (user) {
                const newMessage: Message = {
                  id: Date.now().toString(),
                  sender: user,
                  text,
                  timestamp: new Date(),
                  isCurrentUser: true
                };
                setMessages([...messages, newMessage]);
              }
            }}
          />
        </div>
        
        <SongSuggestionModal 
          isOpen={showSongModal}
          onClose={() => setShowSongModal(false)}
          onSubmit={handleSongSubmit}
        />
        
        <ProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
        
        {isAdmin && (
          <PerksManagement 
            isOpen={showPerksModal}
            onClose={() => setShowPerksModal(false)}
            onPerksUpdated={handlePerksUpdated}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default ChatPage;
