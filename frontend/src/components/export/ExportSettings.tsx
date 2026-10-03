import React from 'react';

export const ExportSettings: React.FC<{ format: string; onSelectFormat: (fmt: string) => void }> = ({
  format,
  onSelectFormat
}) => {
  return (
    <div className="flex gap-4">
      {['9:16', '16:9'].map((fmt) => (
        <button
          key={fmt}
          onClick={() => onSelectFormat(fmt)}
          className={`px-4 py-2 rounded text-sm ${format === fmt ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          {fmt}
        </button>
      ))}
    </div>
  );
};
