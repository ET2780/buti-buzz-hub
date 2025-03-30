
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Logo from './Logo';

interface ButiAvatarProps {
  avatar: string;
  name: string;
  isAdmin?: boolean;
  size?: 'sm' | 'md' | 'lg'; 
}

const ButiAvatar: React.FC<ButiAvatarProps> = ({ 
  avatar, 
  name, 
  isAdmin = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  // For BUTI staff/admin
  if (isAdmin || avatar === 'BUTI') {
    return (
      <Avatar className={`${sizeClasses[size]} bg-white flex items-center justify-center`}>
        <div className="scale-110 flex items-center justify-center">
          <Logo size="small" useImage={true} />
        </div>
      </Avatar>
    );
  }

  // Regular user with emoji avatar
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback className="text-lg">
        {avatar || name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default ButiAvatar;
