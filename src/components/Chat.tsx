
import React from 'react';
import { Message } from '@/types';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ButiAvatar from './ButiAvatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

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
  isSending = false
}) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">צ'אט BUTI</h1>
      </div>
      
      {connectionError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            {connectionError 
              ? "לא ניתן לטעון הודעות כרגע." 
              : isConnecting ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-12 w-[200px]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-[150px]" />
                    </div>
                  </div>
                </div>
              ) : "אין הודעות עדיין. התחילו שיחה!"}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isCurrentUser && (
                  <div className="flex-shrink-0 mr-2">
                    <ButiAvatar
                      avatar={message.sender.avatar}
                      name={message.sender.name}
                      isAdmin={message.sender.isAdmin}
                      size="sm"
                    />
                  </div>
                )}
                
                <div className="max-w-[70%]">
                  {!message.isCurrentUser && (
                    <div className="mb-1">
                      <div className="text-xs text-muted-foreground font-medium flex items-center">
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
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 ${
                      message.isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="text-xs opacity-70 text-right mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={connectionError ? "לא ניתן לשלוח הודעות כרגע" : "הקלידו הודעה..."}
            className="flex-1 rounded-full"
            disabled={!!connectionError || isSending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !!connectionError || isSending}
            className="rounded-full"
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
