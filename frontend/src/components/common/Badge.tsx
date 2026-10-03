import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'danger';
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', text }) => {
  const colors = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}>
      {text}
    </span>
  );
};
