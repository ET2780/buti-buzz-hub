
import React from 'react';
import { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import ButiAvatar from './ButiAvatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            פרופיל משתמש
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-4">
            <ButiAvatar
              avatar={user.avatar}
              name={user.name}
              isAdmin={user.isAdmin}
              size="lg"
            />
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              {user.isAdmin && <Badge variant="outline">צוות BUTI</Badge>}
              {user.customStatus && (
                <p className="text-sm text-muted-foreground mt-1">{user.customStatus}</p>
              )}
            </div>
          </div>
          
          {user.tags && user.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">תחומי עניין</label>
              <div className="flex flex-wrap gap-2">
                {user.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
