import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss }) => {
  const styles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
  };

  return (
    <div className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium z-50 flex items-center gap-3 ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="text-white/80 hover:text-white text-xs">✕</button>
    </div>
  );
};
