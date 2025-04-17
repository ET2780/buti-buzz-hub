import React, { useEffect, useState } from 'react';
import { Message, User } from '@/types';
import { Send, AlertCircle, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import ButiAvatar from './ButiAvatar';
import { useAuth } from '@/hooks/useAuth';
import ProfileModal from './ProfileModal';

interface ChatProps {
  messages: Message[];
  newMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  connectionError: string | null;
  isConnecting: boolean;
  isSending?: boolean;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  newMessage,
  handleInputChange,
  handleKeyDown,
  sendMessage,
  chatContainerRef,
  connectionError,
  isConnecting,
  isSending = false,
}) => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAvatarClick = (message: Message) => {
    if (message.sender) {
      setSelectedUser({
        ...message.sender,
        user_metadata: {
          name: message.sender.name,
          avatar: message.sender.avatar,
          tags: message.sender.tags,
          customStatus: message.sender.customStatus
        }
      });
      setShowProfileModal(true);
    }
  };

  // Listen for profile updates to force a refresh of the component
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent<{user: User}>) => {
      console.log('Profile updated event received in Chat component:', event.detail);
      setCurrentUser(event.detail.user);
    };

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener);
    };
  }, []);

  // Update message sender data with current user data
  const updatedMessages = messages.map(message => {
    if (message.isCurrentUser && currentUser) {
      return {
        ...message,
        sender: {
          ...message.sender,
          name: currentUser.username || currentUser.user_metadata?.name || '',
          avatar: currentUser.avatar || currentUser.user_metadata?.avatar || '',
          tags: currentUser.tags || currentUser.user_metadata?.tags || [],
          customStatus: currentUser.customStatus || currentUser.user_metadata?.customStatus || '',
          isAdmin: currentUser.isAdmin || false
        }
      };
    }
    return message;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0" dir="rtl">
      {connectionError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {updatedMessages.map((message, index) => (
          <div
            key={index}
            className="flex justify-start"
          >
            <div className="flex items-start gap-2 max-w-[80%] flex-row">
              <div 
                className="cursor-pointer"
                onClick={() => handleAvatarClick(message)}
              >
                <ButiAvatar
                  user={{
                    id: message.sender.id,
                    user_metadata: {
                      name: message.sender.name,
                      avatar: message.sender.avatar,
                      tags: message.sender.tags,
                      customStatus: message.sender.customStatus,
                      permissions: {
                        isAdmin: message.sender.isAdmin
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{message.sender.name}</span>
                  {message.sender.isAdmin && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </div>
                <div className="bg-muted rounded-lg p-2">
                  {message.text}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="הקלד הודעה..."
            disabled={isConnecting || isSending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isConnecting || isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default Chat;