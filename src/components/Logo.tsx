
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  useImage?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '', useImage = true }) => {
  const sizeClasses = {
    small: 'text-lg h-8',
    medium: 'text-2xl h-10',
    large: 'text-4xl h-16',
  };

  if (useImage) {
    const imgSizes = {
      small: 'h-8',
      medium: 'h-10',
      large: 'h-16',
    };
    
    return (
      <div className={`${className}`}>
        <img 
          src="/lovable-uploads/f99d9104-41c4-4498-8510-b0435b8a5ac0.png" 
          alt="BUTI Café Logo" 
          className={`${imgSizes[size]}`}
        />
      </div>
    );
  }
  
  // Text fallback version
  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="text-buti-blue">BUTI</span>
      <span className="text-buti-brown">Café</span>
    </div>
  );
};

export default Logo;
