import React from 'react';

export const TimelineItem: React.FC<{ title: string; duration: number }> = ({ title, duration }) => {
  return (
    <div className="p-2 bg-slate-800 rounded border border-slate-700 text-xs text-white">
      {title} ({duration}s)
    </div>
  );
};
