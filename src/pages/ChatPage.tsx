
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import SongSuggestionModal from '@/components/SongSuggestionModal';
import ProfileModal from '@/components/ProfileModal';

// Define the Message interface to ensure consistent typing
interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
    isAdmin?: boolean;
  };
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

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
  const [profile, setProfile] = useState({
    name: 'אורח',
    avatar: '😎',
    isAdmin: false
  });
  
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
        
        const newMessage: Message = {
          id: uuidv4(),
          sender: isButiStaffMessage 
            ? { name: 'צוות BUTI', avatar: 'BUTI', isAdmin: true }
            : { 
                name: users[randomUser], 
                avatar: avatars[randomUser]
              },
          text: isButiStaffMessage 
            ? "אל תשכחו את המבצע של היום: קנו קפה אחד, קבלו עוגיה חינם! ☕🍪" 
            : messages[randomMessage],
          timestamp: new Date(),
          isCurrentUser: false
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    }, 20000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
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
  
  const handleUpdateProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
    localStorage.setItem('butiUser', JSON.stringify(newProfile));
    toast.success('הפרופיל עודכן!');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('butiIsLoggedIn');
    localStorage.removeItem('butiUser');
    navigate('/');
    toast.success('התנתקת בהצלחה');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        onOpenSongModal={() => setSongModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        activeUsersCount={5} // Mock data - in real app, this would be from the backend
        profile={profile}
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
    </div>
  );
};

export default ChatPage;
