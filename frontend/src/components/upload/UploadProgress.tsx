import React from 'react';

export const UploadProgress: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  );
};
