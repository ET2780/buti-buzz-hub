import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';

interface ButiAvatarProps {
  user: User | null;
  className?: string;
}

const ButiAvatar: React.FC<ButiAvatarProps> = ({ user, className }) => {
  const isAdmin = user?.isAdmin || user?.user_metadata?.permissions?.isAdmin || false;
  const name = user?.user_metadata?.name || user?.username || 'אורח';
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const img = new Image();
      img.src = '/buti-logo.png';
      img.onload = () => setImageLoaded(true);
    }
  }, [isAdmin]);

  return (
    <Avatar className={className}>
      {isAdmin ? (
        <>
          <AvatarImage 
            src="/buti-logo.png" 
            alt={name} 
            className="object-contain p-1 bg-white"
            onLoad={() => setImageLoaded(true)}
          />
          <AvatarFallback className="bg-white">
            {imageLoaded ? (
              <img 
                src="/buti-logo.png" 
                alt={name} 
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                Admin
              </div>
            )}
          </AvatarFallback>
        </>
      ) : (
        <>
          <AvatarImage 
            src={user?.user_metadata?.avatar?.startsWith('http') ? user.user_metadata.avatar : undefined} 
            alt={name} 
          />
          <AvatarFallback className="text-lg">
            {user?.user_metadata?.avatar?.startsWith('http') ? name[0] : (user?.user_metadata?.avatar || '😊')}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
};

export default ButiAvatar;
