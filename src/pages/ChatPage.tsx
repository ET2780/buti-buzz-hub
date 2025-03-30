
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
import { toast } from 'sonner';

const ChatPage = () => {
  const { user, isAdmin } = useAuth();
  const [showSongModal, setShowSongModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPerksModal, setShowPerksModal] = useState(false);
  const [activePerks, setActivePerks] = useState<Perk[]>([]);
  const [isLoadingPerks, setIsLoadingPerks] = useState(true);
  
  // Demo messages
  const initialMessages: Message[] = [
    {
      id: "1",
      sender: { name: "אודי", avatar: "🧑", isAdmin: true, id: "admin-1" },
      text: "ברוכים הבאים לצ'אט של קפה BUTI! מי מגיע היום?",
      timestamp: new Date(Date.now() - 60 * 60000),
      isCurrentUser: false
    },
    {
      id: "2",
      sender: { name: "דנה", avatar: "👩", isAdmin: false, id: "user-1" },
      text: "אני אהיה שם בסביבות 14:00, מישהו מצטרף?",
      timestamp: new Date(Date.now() - 45 * 60000),
      isCurrentUser: false
    }
  ];
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeUsers, setActiveUsers] = useState(4);

  useEffect(() => {
    fetchActivePerks();
  }, []);

  const fetchActivePerks = async () => {
    try {
      setIsLoadingPerks(true);
      const perks = await PerksService.getActivePerks();
      setActivePerks(perks);
    } catch (error) {
      console.error('Failed to fetch active perks:', error);
      toast.error('Failed to load perks');
    } finally {
      setIsLoadingPerks(false);
    }
  };

  const handlePerksUpdated = async () => {
    await fetchActivePerks();
  };

  const handleSongSubmit = (songName: string) => {
    toast.success(`תודה על ההצעה! השיר "${songName}" נשלח לצוות BUTI`);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar 
          onOpenSongModal={() => setShowSongModal(true)}
          onOpenProfileModal={() => setShowProfileModal(true)}
          onOpenPerksModal={isAdmin ? () => setShowPerksModal(true) : undefined}
          activeUsersCount={activeUsers}
          activePerks={activePerks}
          isLoadingPerks={isLoadingPerks}
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
