import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = true }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0f1011] border border-[#23252a] rounded-[12px] p-5 transition-all duration-150 ${
        onClick || hoverable ? 'hover:border-[#383b3f]' : ''
      } ${onClick ? 'cursor-pointer hover:bg-[#121315]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

