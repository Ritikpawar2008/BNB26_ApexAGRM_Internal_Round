import React from 'react';

interface LoadingProps {
  label?: string;
}

export const Loading: React.FC<LoadingProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-6 h-6 border-2 border-[#23252a] border-t-[#e4f222] rounded-full animate-spin"></div>
      <p className="text-xs font-mono text-[#8a8f98]">{label}</p>
    </div>
  );
};

