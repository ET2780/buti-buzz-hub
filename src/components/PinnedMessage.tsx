
import React from 'react';
import { Pin, PenLine } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PinnedMessageProps {
  message: string | null;
  onManage?: () => void;
}

const PinnedMessage: React.FC<PinnedMessageProps> = ({
  message,
  onManage
}) => {
  if (!message) return null;
  
  return (
    <Alert className="mx-4 mt-2 mb-2 bg-muted/80 border-primary/30">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary shrink-0" />
          <AlertDescription className="text-foreground">{message}</AlertDescription>
        </div>
        {onManage && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 -mt-1 -mr-1" 
            onClick={onManage}
          >
            <PenLine className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default PinnedMessage;
