import React, { useState } from 'react';
import { Pin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PinnedMessage {
  id: string;
  message: string;
  created_at: string;
}

interface PinnedMessageCardProps {
  messages: PinnedMessage[] | null;
}

const PinnedMessageCard: React.FC<PinnedMessageCardProps> = ({ 
  messages
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset currentIndex when messages change
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [messages]);

  // Return null if there are no messages
  if (!messages || messages.length === 0) {
    return null;
  }

  const nextMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const prevMessage = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  return (
    <Card className="border-buti-sand bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            הודעות נצמדות
            <Pin className="h-4 w-4 text-buti-blue" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{messages[currentIndex].message}</p>
          {messages.length > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMessage}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>{currentIndex + 1}/{messages.length}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMessage}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PinnedMessageCard; 