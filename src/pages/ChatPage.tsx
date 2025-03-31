
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import SongModal from '@/components/SongModal';
import ProfileModal from '@/components/ProfileModal';
import PerksManagement from '@/components/PerksManagement';
import Chat from '@/components/Chat';
import { PerksService } from '@/services/PerksService';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';

const ChatPage = () => {
  const { user } = useAuth();
  const [isSongModalOpen, setIsSongModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = React.useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [activePerks, setActivePerks] = React.useState([]);
  const [isLoadingPerks, setIsLoadingPerks] = React.useState(true);
  const [activeChatUsers, setActiveChatUsers] = React.useState([]);

  // Chat functionality using our custom hook
  const {
    messages,
    newMessage,
    isLoading: isLoadingChat,
    connectionError,
    isSending,
    handleInputChange,
    handleKeyDown,
    sendMessage
  } = useChat();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const openSongModal = () => setIsSongModalOpen(true);
  const closeSongModal = () => setIsSongModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openPerksModal = () => setIsPerksModalOpen(true);
  const closePerksModal = () => setIsPerksModalOpen(false);

  // Function to load active perks
  const loadActivePerks = async () => {
    try {
      setIsLoadingPerks(true);
      const perks = await PerksService.getActivePerks();
      setActivePerks(perks);
    } catch (error) {
      console.error('Error loading active perks:', error);
    } finally {
      setIsLoadingPerks(false);
    }
  };

  // Load perks on mount and listen for changes
  useEffect(() => {
    loadActivePerks();
    
    // Listen for custom event for demo mode updates
    const handleDemoPerksUpdated = () => {
      console.log('Demo perks updated, reloading perks');
      loadActivePerks();
    };
    window.addEventListener('demo-perks-updated', handleDemoPerksUpdated);
    
    // Set up real-time subscription to perks table for Supabase updates
    const channel = supabase
      .channel('public:perks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perks' },
        (payload) => {
          console.log('Perks changed:', payload);
          loadActivePerks(); // Reload perks when any change occurs
        }
      )
      .subscribe();
    
    return () => {
      window.removeEventListener('demo-perks-updated', handleDemoPerksUpdated);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onOpenSongModal={openSongModal}
        onOpenProfileModal={openProfileModal}
        onOpenPerksModal={openPerksModal}
        activeUsersCount={activeChatUsers.length > 0 ? activeChatUsers.length - 1 : 0}
        activePerks={activePerks}
        isLoadingPerks={isLoadingPerks}
      />
      
      <Chat
        messages={messages}
        newMessage={newMessage}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        sendMessage={sendMessage}
        chatContainerRef={chatContainerRef}
        connectionError={connectionError}
        isConnecting={isLoadingChat}
        isSending={isSending}
      />
      
      {isSongModalOpen && (
        <SongModal isOpen={isSongModalOpen} onClose={closeSongModal} />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
      )}
      
      {isPerksModalOpen && (
        <PerksManagement
          isOpen={isPerksModalOpen}
          onClose={closePerksModal}
          onPerksUpdated={loadActivePerks}
        />
      )}
    </div>
  );
};

export default ChatPage;
