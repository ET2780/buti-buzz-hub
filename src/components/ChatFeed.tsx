
import React, { useRef, useEffect } from 'react';
import { Send, Smile, Bot, Pin, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ButiAvatar from './ButiAvatar';
import { Message, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatFeedProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onUserAvatarClick?: (user: User) => void;
  pinnedMessage?: string | null;
  onManagePinnedMessage?: () => void;
}

const ChatFeed: React.FC<ChatFeedProps> = ({ 
  messages, 
  onSendMessage,
  onUserAvatarClick,
  pinnedMessage,
  onManagePinnedMessage
}) => {
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

  const handleAvatarClick = (user: User) => {
    if (onUserAvatarClick) {
      onUserAvatarClick(user);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold">צ'אט קפה BUTI</h1>
        <p className="text-sm text-muted-foreground">שוחח/י עם אחרים בקפה כרגע</p>
      </div>
      
      {pinnedMessage && (
        <Alert className="mx-4 mt-2 bg-muted/80 border-primary/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary shrink-0" />
              <AlertDescription className="text-foreground">{pinnedMessage}</AlertDescription>
            </div>
            {onManagePinnedMessage && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mt-1 -mr-1" 
                onClick={onManagePinnedMessage}
              >
                <PenLine className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      )}
      
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
                    <div 
                      className="mr-2 cursor-pointer" 
                      onClick={() => handleAvatarClick(message.sender)}
                    >
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
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => handleAvatarClick(message.sender)}
                        >
                          {message.sender.name}
                        </span>
                        {message.sender.customStatus && (
                          <span className="text-[10px] text-muted-foreground mx-1">
                            • {message.sender.customStatus}
                          </span>
                        )}
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
