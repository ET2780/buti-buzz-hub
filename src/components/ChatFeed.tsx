
import React, { useRef, useEffect } from 'react';
import { Send, Smile, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ButiAvatar from './ButiAvatar';
import { Message } from '@/types';
import { Badge } from '@/components/ui/badge';

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
        <h1 className="text-xl font-semibold">צ'אט קפה BUTI</h1>
        <p className="text-sm text-muted-foreground">שוחח/י עם אחרים בקפה כרגע</p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isAutomated 
                  ? "justify-center" 
                  : message.isCurrentUser 
                    ? "justify-end" 
                    : "justify-start"
              }`}
            >
              {message.isAutomated ? (
                <div className="bg-muted/50 rounded-lg p-3 max-w-[80%] border border-border shadow-sm flex items-center gap-2">
                  <Bot size={16} className="text-primary" />
                  <div>
                    <p className="font-medium text-sm">{message.text}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!message.isCurrentUser && (
                    <div className="mr-2">
                      <ButiAvatar 
                        avatar={message.sender.avatar} 
                        name={message.sender.name} 
                        isAdmin={message.sender.isAdmin}
                        size="sm"
                      />
                    </div>
                  )}
                  <div>
                    {!message.isCurrentUser && (
                      <div className="text-xs text-muted-foreground mb-1 flex items-center">
                        <span>{message.sender.name}</span>
                        {message.sender.tags && message.sender.tags.length > 0 && (
                          <div className="flex gap-1 mr-1 flex-wrap">
                            {message.sender.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {message.sender.tags.length > 2 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                +{message.sender.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`message-bubble ${
                        message.isCurrentUser
                          ? "message-bubble-mine"
                          : "message-bubble-others"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                </>
              )}
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
            placeholder="הקלד/י הודעה..."
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
