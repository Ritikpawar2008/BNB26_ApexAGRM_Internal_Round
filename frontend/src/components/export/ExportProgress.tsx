import React from 'react';

export const ExportProgress: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="space-y-2 text-center">
      <p className="text-sm text-slate-400">Exporting video: {progress}%</p>
    </div>
  );
};
