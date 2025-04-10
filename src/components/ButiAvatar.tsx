import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

export const ButiAvatar = ({ user }: { user: User | null }) => {
  // Check admin status from both possible locations
  const isAdmin = user?.isAdmin || user?.user_metadata?.permissions?.isAdmin === true;
  
  // Get name from both possible locations
  const name = user?.user_metadata?.name || user?.username || 'אורח';
  
  // Get avatar from both possible locations
  const avatar = user?.user_metadata?.avatar || user?.avatar || '😊';

  if (isAdmin) {
    return (
      <Avatar>
        <AvatarImage src="/buti-logo.png" alt={name} className="object-contain" />
        <AvatarFallback>
          <img src="/buti-logo.png" alt={name} className="w-full h-full object-contain" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar>
      {avatar.startsWith('http') ? (
        <AvatarImage src={avatar} alt={name} />
      ) : (
        <AvatarFallback className="text-xl">
          {avatar}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
