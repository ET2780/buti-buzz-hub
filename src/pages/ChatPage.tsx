
import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import SongModal from '@/components/SongModal';
import ProfileModal from '@/components/ProfileModal';
import UserProfileModal from '@/components/UserProfileModal';
import PinnedMessageManager from '@/components/PinnedMessageManager';
import PerksManagement from '@/components/PerksManagement';
import Chat from '@/components/Chat';
import { PerksService } from '@/services/PerksService';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';
import { User, SystemMessage } from '@/types';

const ChatPage = () => {
  const { user } = useAuth();
  const [isSongModalOpen, setIsSongModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = React.useState(false);
  const [isPinnedMessageModalOpen, setIsPinnedMessageModalOpen] = React.useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [activePerks, setActivePerks] = React.useState([]);
  const [isLoadingPerks, setIsLoadingPerks] = React.useState(true);

  // Chat functionality using our custom hook
  const {
    messages,
    newMessage,
    isLoading: isLoadingChat,
    connectionError,
    isSending,
    activeChatUsers,
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

  // Fetch pinned message when component mounts
  useEffect(() => {
    const fetchPinnedMessage = async () => {
      try {
        // Explicitly type the response data
        const { data, error } = await supabase
          .from('system_messages' as any)
          .select('text')
          .eq('id', 'pinned')
          .maybeSingle();
          
        if (error) throw error;
        
        // Add comprehensive null and type checking
        if (data && typeof data === 'object' && 'text' in data) {
          const pinnedText = data.text;
          if (typeof pinnedText === 'string') {
            setPinnedMessage(pinnedText);
          }
        }
      } catch (error) {
        console.error('Error fetching pinned message:', error);
      }
    };
    
    fetchPinnedMessage();
  }, []);

  // Set up subscription to system_messages table for real-time updates
  useEffect(() => {
    const systemChannel = supabase
      .channel('system-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_messages' },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          if (newData && newData.id === 'pinned' && typeof newData.text === 'string') {
            setPinnedMessage(newData.text);
          } else if (payload.eventType === 'DELETE' && oldData && oldData.id === 'pinned') {
            setPinnedMessage(null);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(systemChannel);
    };
  }, []);

  const openSongModal = () => setIsSongModalOpen(true);
  const closeSongModal = () => setIsSongModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openPerksModal = () => setIsPerksModalOpen(true);
  const closePerksModal = () => setIsPerksModalOpen(false);

  const openPinnedMessageModal = () => setIsPinnedMessageModalOpen(true);
  const closePinnedMessageModal = () => setIsPinnedMessageModalOpen(false);

  const handleUserAvatarClick = (clickedUser: User) => {
    if (clickedUser.id === user?.id) {
      // If clicking own avatar, open profile modal
      openProfileModal();
    } else {
      // If clicking another user's avatar, open user profile modal
      setSelectedUser(clickedUser);
      setIsUserProfileModalOpen(true);
    }
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
    setSelectedUser(null);
  };

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

  // Calculate active users count (excluding current user)
  const activeUsersCount = activeChatUsers.length > 0 
    ? activeChatUsers.filter(chatUser => chatUser.id !== user?.id).length 
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onOpenSongModal={openSongModal}
        onOpenProfileModal={openProfileModal}
        onOpenPerksModal={openPerksModal}
        activeUsersCount={activeUsersCount}
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
        onUserAvatarClick={handleUserAvatarClick}
        pinnedMessage={pinnedMessage}
        onManagePinnedMessage={user?.isAdmin ? openPinnedMessageModal : undefined}
      />
      
      {isSongModalOpen && (
        <SongModal isOpen={isSongModalOpen} onClose={closeSongModal} />
      )}
      
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />
      )}
      
      {isUserProfileModalOpen && selectedUser && (
        <UserProfileModal 
          isOpen={isUserProfileModalOpen} 
          onClose={closeUserProfileModal} 
          user={selectedUser} 
        />
      )}
      
      {isPinnedMessageModalOpen && user?.isAdmin && (
        <PinnedMessageManager
          isOpen={isPinnedMessageModalOpen}
          onClose={closePinnedMessageModal}
          currentPinnedMessage={pinnedMessage}
          onMessageUpdated={setPinnedMessage}
        />
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
