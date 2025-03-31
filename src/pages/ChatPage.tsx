import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { User } from '@/types';
import { useChat } from '@/hooks/useChat';
import { usePinnedMessage } from '@/hooks/usePinnedMessage';
import { PerksService } from '@/services/PerksService';
import { supabase } from '@/integrations/supabase/client';
import ChatContainer from '@/components/ChatContainer';
import ModalManager from '@/components/ModalManager';

const ChatPage = () => {
  const { user } = useAuth();
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isPinnedMessageModalOpen, setIsPinnedMessageModalOpen] = useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activePerks, setActivePerks] = useState([]);
  const [isLoadingPerks, setIsLoadingPerks] = useState(true);
  const { pinnedMessage, setPinnedMessage } = usePinnedMessage();

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
      
      <ChatContainer
        messages={messages}
        newMessage={newMessage}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        sendMessage={sendMessage}
        connectionError={connectionError}
        isLoadingChat={isLoadingChat}
        isSending={isSending}
        pinnedMessage={pinnedMessage}
        onUserAvatarClick={handleUserAvatarClick}
        onManagePinnedMessage={user?.isAdmin ? openPinnedMessageModal : undefined}
      />
      
      <ModalManager
        isSongModalOpen={isSongModalOpen}
        isProfileModalOpen={isProfileModalOpen}
        isUserProfileModalOpen={isUserProfileModalOpen}
        isPinnedMessageModalOpen={isPinnedMessageModalOpen}
        isPerksModalOpen={isPerksModalOpen}
        selectedUser={selectedUser}
        pinnedMessage={pinnedMessage}
        closeSongModal={closeSongModal}
        closeProfileModal={closeProfileModal}
        closeUserProfileModal={closeUserProfileModal}
        closePinnedMessageModal={closePinnedMessageModal}
        closePerksModal={closePerksModal}
        onPinnedMessageUpdated={setPinnedMessage}
        onPerksUpdated={loadActivePerks}
        isAdmin={user?.isAdmin || false}
      />
    </div>
  );
};

export default ChatPage;
