import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'accent';
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', text, className = '' }) => {
  const colors = {
    success: 'bg-[#27a644]/10 text-[#27a644] border-[#27a644]/25',
    warning: 'bg-[#e4f222]/10 text-[#e4f222] border-[#e4f222]/25',
    info: 'bg-[#6366f1]/10 text-[#818cf8] border-[#6366f1]/25',
    danger: 'bg-[#eb5757]/10 text-[#eb5757] border-[#eb5757]/25',
    neutral: 'bg-white/[0.04] text-[#8a8f98] border-[#23252a]',
    accent: 'bg-[#02b8cc]/10 text-[#02b8cc] border-[#02b8cc]/25',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-mono tracking-tight border ${colors[variant]} ${className}`}>
      {text}
    </span>
  );
};

