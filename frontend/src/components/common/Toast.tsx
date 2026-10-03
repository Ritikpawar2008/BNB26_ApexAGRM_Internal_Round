import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from './utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onDismiss, 
  duration = 5000,
  className 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const styles = {
    success: 'bg-emerald-900 border-emerald-800 text-emerald-100',
    error: 'bg-rose-900 border-rose-800 text-rose-100',
    info: 'bg-indigo-900 border-indigo-800 text-indigo-100',
  };

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;
  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-indigo-400',
  };

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm font-medium z-50 flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-300", 
        styles[type],
        className
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5", iconColors[type])} />
      <span>{message}</span>
      <button 
        onClick={onDismiss} 
        className="ml-2 text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 rounded p-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
