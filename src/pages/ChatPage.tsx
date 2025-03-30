
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import SongSuggestionModal from '@/components/SongSuggestionModal';
import ProfileModal from '@/components/ProfileModal';
import PerksManagement from '@/components/PerksManagement';
import { Message, Perk, User } from '@/types';

// Mock initial perk data
const INITIAL_PERK: Perk = {
  id: '1',
  title: 'הטבת היום',
  description: 'קנו קפה אחד, קבלו עוגיה חינם! ☕🍪',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock data for demo
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: { name: 'נועה', avatar: '🌟' },
    text: 'היי לכולם! הרגע הגעתי. הפלייליסט היום מעולה.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isCurrentUser: false
  },
  {
    id: '2',
    sender: { name: 'עמית', avatar: '🚀' },
    text: 'ברוכים הבאים! אני עובד על הפרויקט שלי ליד החלון.',
    timestamp: new Date(Date.now() - 3600000),
    isCurrentUser: false
  },
  {
    id: '3',
    sender: { name: 'צוות BUTI', avatar: 'BUTI', isAdmin: true },
    text: 'הקפה היום מעולה במיוחד! נסו את התערובת החדשה.',
    timestamp: new Date(Date.now() - 1800000),
    isCurrentUser: false
  },
  {
    id: '4',
    sender: { name: 'דנה', avatar: '🍩' },
    text: 'מישהו רוצה לחלוק שולחן? נהיה צפוף.',
    timestamp: new Date(Date.now() - 900000),
    isCurrentUser: false
  }
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isSongModalOpen, setSongModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isPerksModalOpen, setPerksModalOpen] = useState(false);
  const [profile, setProfile] = useState<User>({
    name: 'אורח',
    avatar: '😎',
    isAdmin: false
  });
  const [perks, setPerks] = useState<Perk[]>([INITIAL_PERK]);
  const [activeUsers, setActiveUsers] = useState(5);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('butiIsLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    // Load saved profile if it exists
    const savedProfile = localStorage.getItem('butiUser');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    
    // Load saved perks if they exist
    const savedPerks = localStorage.getItem('butiPerks');
    if (savedPerks) {
      setPerks(JSON.parse(savedPerks));
    }
    
    // Set up "simulated" real-time chat
    const interval = setInterval(() => {
      // 20% chance of new message every 20 seconds
      if (Math.random() < 0.2) {
        const users = ['נועה', 'עמית', 'טל', 'דנה', 'יוני', 'מאיה'];
        const avatars = ['🌟', '🚀', '🦄', '🍩', '☕', '🌈'];
        const messages = [
          'מישהו ניסה את המאפים החדשים?',
          'השיר הזה כל כך טוב!',
          'מי עוד כאן עד הסגירה?',
          'הוואיפיי נראה מהיר יותר היום!',
          'סיימתי עכשיו פרויקט גדול. זמן לחגוג!',
          'מישהו יודע את השם של השיר שמתנגן?',
          'מזג אוויר מושלם לקפה היום!'
        ];
        
        const randomUser = Math.floor(Math.random() * users.length);
        const randomMessage = Math.floor(Math.random() * messages.length);
        
        // Small chance of BUTI staff message
        const isButiStaffMessage = Math.random() < 0.1;
        
        // Find active perk
        const activePerk = perks.find(perk => perk.isActive);
        
        const newMessage: Message = {
          id: uuidv4(),
          sender: isButiStaffMessage 
            ? { name: 'צוות BUTI', avatar: 'BUTI', isAdmin: true }
            : { 
                name: users[randomUser], 
                avatar: avatars[randomUser]
              },
          text: isButiStaffMessage && activePerk
            ? `אל תשכחו את המבצע של היום: ${activePerk.description}`
            : messages[randomMessage],
          timestamp: new Date(),
          isCurrentUser: false
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
      
      // Simulate users joining/leaving
      if (Math.random() < 0.1) {
        setActiveUsers(prev => Math.max(3, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 20000);
    
    return () => clearInterval(interval);
  }, [navigate, perks]);
  
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      sender: profile,
      text,
      timestamp: new Date(),
      isCurrentUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  const handleSuggestSong = (song: string) => {
    toast.success('קיבלנו את הצעת השיר!', {
      description: `תודה שהצעת "${song}". אם זה מתאים לאווירה, יתכן שינוגן היום.`
    });
  };
  
  const handleUpdateProfile = (newProfile: User) => {
    setProfile(newProfile);
    localStorage.setItem('butiUser', JSON.stringify(newProfile));
    toast.success('הפרופיל עודכן!');
  };
  
  const handleUpdatePerks = (updatedPerks: Perk[]) => {
    setPerks(updatedPerks);
    localStorage.setItem('butiPerks', JSON.stringify(updatedPerks));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('butiIsLoggedIn');
    localStorage.removeItem('butiUser');
    navigate('/');
    toast.success('התנתקת בהצלחה');
  };
  
  // Get active perk for the sidebar
  const activePerk = perks.find(perk => perk.isActive);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        onOpenSongModal={() => setSongModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenPerksModal={profile.isAdmin ? () => setPerksModalOpen(true) : undefined}
        activeUsersCount={activeUsers}
        profile={profile}
        activePerk={activePerk}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatFeed 
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
      
      <SongSuggestionModal 
        isOpen={isSongModalOpen}
        onClose={() => setSongModalOpen(false)}
        onSubmit={handleSuggestSong}
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />
      
      {profile.isAdmin && (
        <PerksManagement
          isOpen={isPerksModalOpen}
          onClose={() => setPerksModalOpen(false)}
          perks={perks}
          onUpdatePerks={handleUpdatePerks}
        />
      )}
    </div>
  );
};

export default ChatPage;
