import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  code?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  code = 'UNKNOWN_ERROR',
  message = 'An unexpected error occurred.',
  onRetry
}) => {
  return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center space-y-3">
      <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
      <h4 className="text-base font-semibold text-white">Error: {code}</h4>
      <p className="text-sm text-slate-300">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try Again</Button>}
    </div>
  );
};
