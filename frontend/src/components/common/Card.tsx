import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg ${onClick ? 'cursor-pointer hover:border-indigo-500 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
