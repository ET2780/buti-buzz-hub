
import React, { useRef, useEffect } from 'react';
import { Message, User } from '@/types';
import Chat from '@/components/Chat';
import PinnedMessage from '@/components/PinnedMessage';

interface ChatContainerProps {
  messages: Message[];
  newMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  connectionError: string | null;
  isLoadingChat: boolean;
  isSending: boolean;
  pinnedMessage: string | null;
  onUserAvatarClick: (user: User) => void;
  onManagePinnedMessage?: () => void;
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
  pinnedMessage,
  onUserAvatarClick,
  onManagePinnedMessage
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">צ'אט BUTI</h1>
      </div>
      
      <PinnedMessage 
        message={pinnedMessage}
        onManage={onManagePinnedMessage}
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
        onUserAvatarClick={onUserAvatarClick}
        pinnedMessage={pinnedMessage}
        onManagePinnedMessage={onManagePinnedMessage}
      />
    </div>
  );
};

export default ChatContainer;
