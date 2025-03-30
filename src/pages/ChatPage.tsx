
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { User, Message, Perk } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/Sidebar';
import SongModal from '@/components/SongModal';
import ProfileModal from '@/components/ProfileModal';
import PerksManagement from '@/components/PerksManagement';
import Chat from '@/components/Chat';
import { PerksService } from '@/services/PerksService';

// Define a fallback socket URL if the environment variable is not available
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [activeChatUsers, setActiveChatUsers] = useState<User[]>([]);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [activePerks, setActivePerks] = useState<Perk[]>([]);
  const [isLoadingPerks, setIsLoadingPerks] = useState(true);

  const openSongModal = () => setIsSongModalOpen(true);
  const closeSongModal = () => setIsSongModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openPerksModal = () => setIsPerksModalOpen(true);
  const closePerksModal = () => setIsPerksModalOpen(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('users', (users: User[]) => {
      setOnlineUsers(users);
      const activeUsers = [user, ...users];
      setActiveChatUsers(activeUsers);
    });

    newSocket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = () => {
    if (newMessage.trim() && user) {
      const message: Message = {
        id: uuidv4(),
        sender: user,
        text: newMessage,
        timestamp: new Date(),
        isCurrentUser: true,
      };
      socket.emit('message', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onOpenSongModal={openSongModal}
        onOpenProfileModal={openProfileModal}
        onOpenPerksModal={openPerksModal}
        activeUsersCount={activeChatUsers.length - 1}
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
