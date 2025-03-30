
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/components/Sidebar';
import ChatFeed from '@/components/ChatFeed';
import SongSuggestionModal from '@/components/SongSuggestionModal';
import ProfileModal from '@/components/ProfileModal';
import ButiAvatar from '@/components/ButiAvatar';

// Mock data for demo
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: { name: 'Noa', avatar: '🌟' },
    text: 'Hey everyone! Just got here. Great playlist today.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isCurrentUser: false
  },
  {
    id: '2',
    sender: { name: 'Amit', avatar: '🚀' },
    text: 'Welcome! I\'m working on my project by the window.',
    timestamp: new Date(Date.now() - 3600000),
    isCurrentUser: false
  },
  {
    id: '3',
    sender: { name: 'BUTI Staff', avatar: 'BUTI', isAdmin: true },
    text: 'The coffee is extra good today! Try the new blend.',
    timestamp: new Date(Date.now() - 1800000),
    isCurrentUser: false
  },
  {
    id: '4',
    sender: { name: 'Dana', avatar: '🍩' },
    text: 'Anyone want to share a table? It\'s getting crowded.',
    timestamp: new Date(Date.now() - 900000),
    isCurrentUser: false
  }
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isSongModalOpen, setSongModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Guest User',
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
        const users = ['Noa', 'Amit', 'Tal', 'Dana', 'Yoni', 'Maya'];
        const avatars = ['🌟', '🚀', '🦄', '🍩', '☕', '🌈'];
        const messages = [
          'Anyone tried the new pastries?',
          'This song is so good!',
          'Who else is here until closing?',
          'The WiFi seems faster today!',
          'Just finished a big project. Time to celebrate!',
          'Does anyone know the name of this song playing?',
          'Perfect coffee weather today!'
        ];
        
        const randomUser = Math.floor(Math.random() * users.length);
        const randomMessage = Math.floor(Math.random() * messages.length);
        
        // Small chance of BUTI staff message
        const isButiStaffMessage = Math.random() < 0.1;
        
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: uuidv4(),
            sender: isButiStaffMessage 
              ? { name: 'BUTI Staff', avatar: 'BUTI', isAdmin: true }
              : { 
                  name: users[randomUser], 
                  avatar: avatars[randomUser]
                },
            text: isButiStaffMessage 
              ? "Don't forget today's special: Buy 1 coffee, get a cookie free! ☕🍪" 
              : messages[randomMessage],
            timestamp: new Date(),
            isCurrentUser: false
          }
        ]);
      }
    }, 20000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: uuidv4(),
      sender: profile,
      text,
      timestamp: new Date(),
      isCurrentUser: true
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  const handleSuggestSong = (song: string) => {
    toast.success('Song suggestion received!', {
      description: `Thanks for suggesting "${song}". If it fits the vibe, it may play today.`
    });
  };
  
  const handleUpdateProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
    localStorage.setItem('butiUser', JSON.stringify(newProfile));
    toast.success('Profile updated!');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('butiIsLoggedIn');
    localStorage.removeItem('butiUser');
    navigate('/');
    toast.success('Logged out successfully');
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
          CustomAvatar={ButiAvatar}
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
