import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, actionText, onAction, icon, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-700 bg-slate-800/20 rounded-xl", className)}
        {...props}
      >
        <div className="mb-4 text-slate-500">
          {icon || <FolderOpen className="w-12 h-12 mx-auto" />}
        </div>
        <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-4 max-w-sm">{description}</p>
        {actionText && onAction && (
          <Button onClick={onAction}>{actionText}</Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
