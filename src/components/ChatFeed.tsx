
import React, { useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface ChatFeedProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const ChatFeed: React.FC<ChatFeedProps> = ({ messages, onSendMessage }) => {
  const [messageText, setMessageText] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">BUTI Café Chat</h1>
        <p className="text-sm text-muted-foreground">Chat with others at the café right now</p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              {!message.isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground mr-2">
                  {message.sender.avatar}
                </div>
              )}
              <div>
                {!message.isCurrentUser && (
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.sender.name}
                  </div>
                )}
                <div
                  className={`message-bubble ${
                    message.isCurrentUser
                      ? 'message-bubble-mine'
                      : 'message-bubble-others'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Smile size={20} />
          </Button>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow border-muted"
          />
          <Button onClick={handleSendMessage} size="icon" disabled={!messageText.trim()}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatFeed;
