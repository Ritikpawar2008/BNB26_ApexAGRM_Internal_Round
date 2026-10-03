import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ code = 'UNKNOWN_ERROR', message = 'An unexpected error occurred.', onRetry, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn("bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center flex flex-col items-center justify-center", className)}
        {...props}
      >
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h4 className="text-base font-semibold text-white mb-1">
          {code !== 'UNKNOWN_ERROR' ? `Error: ${code}` : 'Something went wrong'}
        </h4>
        <p className="text-sm text-slate-300 mb-4 max-w-sm">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="border-rose-500/30 text-rose-200 hover:bg-rose-500/20">
            Try Again
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";
