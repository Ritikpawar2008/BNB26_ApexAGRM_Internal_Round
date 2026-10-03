import React from 'react';

interface LoadingProps {
  label?: string;
}

export const Loading: React.FC<LoadingProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
};
