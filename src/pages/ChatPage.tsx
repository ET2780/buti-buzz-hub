
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
import { toast } from '@/components/ui/use-toast';

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
  const socketRef = useRef<any>(null);

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

  // Initialize socket connection when user is available
  useEffect(() => {
    if (!user) return;

    // Clean up previous socket if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log(`Connecting to socket at ${SOCKET_URL} with user:`, user);
    
    // Create new socket connection with user info
    const newSocket = io(SOCKET_URL, {
      query: { 
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        isAdmin: user.isAdmin ? 'true' : 'false'
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      toast({
        title: "מחובר לצ'אט",
        description: "התחברת בהצלחה לצ'אט BUTI",
      });
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      toast({
        title: "שגיאת התחברות",
        description: "לא הצלחנו להתחבר לשרת הצ'אט. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    });

    newSocket.on('users', (users: User[]) => {
      console.log('Received online users:', users);
      setOnlineUsers(users);
      
      // Add current user to active users if not already included
      const hasCurrentUser = users.some(u => u.id === user.id);
      const activeUsers = hasCurrentUser ? users : [user, ...users];
      setActiveChatUsers(activeUsers);
    });

    // Handle receiving messages from server
    newSocket.on('message', (message: Message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => {
        // Check if message is already in the list to avoid duplicates
        const isDuplicate = prevMessages.some(m => m.id === message.id);
        if (isDuplicate) {
          return prevMessages;
        }
        
        // Add isCurrentUser flag based on sender ID
        const messageWithFlag = {
          ...message,
          isCurrentUser: message.sender.id === user.id
        };
        return [...prevMessages, messageWithFlag];
      });
    });

    // Handle receiving previous messages when joining
    newSocket.on('previous_messages', (previousMessages: Message[]) => {
      console.log('Received previous messages:', previousMessages);
      if (Array.isArray(previousMessages) && previousMessages.length > 0) {
        setMessages(previousMessages.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender.id === user.id
        })));
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Clean up socket connection on component unmount
    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const sendMessage = () => {
    if (newMessage.trim() && user && socket) {
      const message: Message = {
        id: uuidv4(),
        sender: user,
        text: newMessage,
        timestamp: new Date(),
        isCurrentUser: true,
      };
      
      console.log('Sending message:', message);
      socket.emit('message', message);
      
      // Add message to local state
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
