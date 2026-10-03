import React from 'react';

export const FilePreview: React.FC<{ file: File; onClear: () => void }> = ({ file, onClear }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
      <span className="text-sm text-white">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
      <button onClick={onClear} className="text-rose-400 text-xs">Remove</button>
    </div>
  );
};
