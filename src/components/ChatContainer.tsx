import React, { useRef, useEffect } from 'react';
import { Message, User } from '@/types';
import Chat from '@/components/Chat';

interface ChatContainerProps {
  messages: Message[];
  newMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  connectionError: string | null;
  isLoadingChat: boolean;
  isSending: boolean;
  onUserAvatarClick: (user: User) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  newMessage,
  handleInputChange,
  handleKeyDown,
  sendMessage,
  connectionError,
  isLoadingChat,
  isSending,
  onUserAvatarClick,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-border">
        <h1 className="text-xl font-semibold">צ'אט BUTI</h1>
      </div>
      
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
        onUserAvatarClick={onUserAvatarClick}
      />
    </div>
  );
};

export default ChatContainer;
