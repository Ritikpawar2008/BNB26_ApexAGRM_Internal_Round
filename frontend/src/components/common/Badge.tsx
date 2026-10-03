import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'default';
  text?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'info', text, children, ...props }, ref) => {
    const colors = {
      default: 'bg-slate-800 text-slate-100 border-slate-700',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          colors[variant],
          className
        )}
        {...props}
      >
        {text || children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
