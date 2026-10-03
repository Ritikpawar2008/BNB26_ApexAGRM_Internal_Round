import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ label = 'Loading...', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <div 
        ref={ref}
        className={cn("flex flex-col items-center justify-center p-8 space-y-3", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-indigo-500", sizeClasses[size])} />
        {label && <p className="text-sm text-slate-400">{label}</p>}
      </div>
    );
  }
);
Loading.displayName = "Loading";
