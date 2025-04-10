import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { User, PinnedMessage } from '@/types';
import { useChat } from '@/hooks/useChat';
import { usePinnedMessage } from '@/hooks/usePinnedMessage';
import { PerksService } from '@/services/PerksService';
import { createClient } from '@supabase/supabase-js';
import ChatContainer from '@/components/ChatContainer';
import ModalManager from '@/components/ModalManager';
import { Button } from '@/components/ui/button';

// Create service role client
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export function ChatPage() {
  const { user } = useAuth();
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isPinnedMessageModalOpen, setIsPinnedMessageModalOpen] = useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const [isSongRequestManagerOpen, setIsSongRequestManagerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activePerks, setActivePerks] = useState([]);
  const [isLoadingPerks, setIsLoadingPerks] = useState(true);
  const { pinnedMessage, setPinnedMessage } = usePinnedMessage();
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[] | null>(null);
  const isAdmin = user?.user_metadata?.isAdmin;

  // Update pinnedMessages when pinnedMessage changes
  useEffect(() => {
    if (pinnedMessage) {
      setPinnedMessages([{
        id: 'current',
        message: pinnedMessage,
        created_at: new Date().toISOString()
      }]);
    } else {
      setPinnedMessages(null);
    }
  }, [pinnedMessage]);

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

  const openSongRequestForm = () => {
    setIsSongModalOpen(true);
    setIsSongRequestManagerOpen(false);
  };

  const openSongRequestManager = () => {
    setIsSongRequestManagerOpen(true);
    setIsSongModalOpen(false);
  };

  const closeSongRequestManager = () => setIsSongRequestManagerOpen(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const handleUserAvatarClick = async (clickedUser: User) => {
    if (clickedUser.id === user?.id) {
      // If clicking own avatar, open profile modal
      openProfileModal();
    } else {
      // If clicking another user's avatar, fetch complete profile and open user profile modal
      try {
        console.log('Fetching profile for user:', clickedUser.id);
        
        const { data: profile, error } = await adminClient
          .from('profiles')
          .select('id, name, avatar, tags, custom_status')
          .eq('id', clickedUser.id)
          .single();
        
        if (!error && profile) {
          console.log('Fetched profile data:', profile);
          
          // Create a complete user object from profile data
          const completeUser: User = {
            id: clickedUser.id,
            username: profile.name || clickedUser.username,
            avatar: profile.avatar || clickedUser.avatar,
            isAdmin: clickedUser.isAdmin,
            tags: profile.tags || [],
            customStatus: profile.custom_status || '',
            isTemporary: clickedUser.isTemporary
          };
          
          setSelectedUser(completeUser);
          setIsUserProfileModalOpen(true);
        } else {
          // If no profile found, use the clicked user data as fallback
          setSelectedUser(clickedUser);
          setIsUserProfileModalOpen(true);
        }
      } catch (error) {
        console.error('Error handling user avatar click:', error);
        // If there's an error, still try to show the modal with basic user data
        setSelectedUser(clickedUser);
        setIsUserProfileModalOpen(true);
      }
    }
  };

  const closeUserProfileModal = () => {
    setIsUserProfileModalOpen(false);
    setSelectedUser(null);
  };

  // Set up real-time subscription for profile changes - only for selected user in modal
  useEffect(() => {
    if (!user || !selectedUser) return;

    const channel = adminClient
      .channel('selected-user-profile-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${selectedUser.id}`
        },
        async (payload) => {
          console.log('Selected user profile changed:', payload);
          const updatedProfile = await fetchUserProfile(selectedUser.id);
          if (updatedProfile) {
            const updatedUser: User = {
              ...selectedUser,
              username: updatedProfile.name || selectedUser.username,
              avatar: updatedProfile.avatar || selectedUser.avatar,
              tags: updatedProfile.tags || [],
              customStatus: updatedProfile.custom_status
            };
            setSelectedUser(updatedUser);
          }
        }
      )
      .subscribe();

    return () => {
      adminClient.removeChannel(channel);
    };
  }, [selectedUser, user]);

  // Function to load active perks
  const loadActivePerks = async () => {
    try {
      setIsLoadingPerks(true);
      console.log('Loading active perks...');
      const perks = await PerksService.getActivePerks();
      console.log('Loaded active perks:', perks);
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
    
    // Set up real-time subscription to perks table
    const channel = adminClient
      .channel('public:perks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perks' },
        (payload) => {
          console.log('Perks changed:', payload);
          loadActivePerks();
        }
      )
      .subscribe();
    
    return () => {
      adminClient.removeChannel(channel);
    };
  }, []);

  // Calculate active users count (excluding current user)
  const activeUsersCount = activeChatUsers.length > 0 
    ? activeChatUsers.filter(u => u.id !== user?.id).length 
    : 0;

  const handlePinnedMessagesUpdate = (messages: PinnedMessage[] | null) => {
    console.log('Pinned messages updated:', messages);
    setPinnedMessages(messages);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <ChatContainer
          messages={messages}
          newMessage={newMessage}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          sendMessage={sendMessage}
          connectionError={connectionError}
          isLoadingChat={isLoadingChat}
          isSending={isSending}
          onUserAvatarClick={handleUserAvatarClick}
        />
      </div>
      <Sidebar
        activeUsersCount={activeChatUsers.length}
        activePerks={activePerks}
        isLoadingPerks={isLoadingPerks}
        onOpenSongRequest={openSongRequestForm}
        onOpenSongRequestManager={openSongRequestManager}
        isAdmin={isAdmin}
        pinnedMessages={pinnedMessages}
      />
      <ModalManager
        isSongModalOpen={isSongModalOpen}
        isProfileModalOpen={isProfileModalOpen}
        isUserProfileModalOpen={isUserProfileModalOpen}
        isPinnedMessageModalOpen={isPinnedMessageModalOpen}
        isPerksModalOpen={isPerksModalOpen}
        isSongRequestManagerOpen={isSongRequestManagerOpen}
        selectedUser={selectedUser}
        pinnedMessage={null}
        closeSongModal={closeSongModal}
        closeProfileModal={closeProfileModal}
        closeUserProfileModal={closeUserProfileModal}
        closePinnedMessageModal={closePinnedMessageModal}
        closePerksModal={closePerksModal}
        closeSongRequestManager={closeSongRequestManager}
        onPinnedMessageUpdated={handlePinnedMessagesUpdate}
        onPerksUpdated={loadActivePerks}
        isAdmin={isAdmin}
      />
    </div>
  );
}

