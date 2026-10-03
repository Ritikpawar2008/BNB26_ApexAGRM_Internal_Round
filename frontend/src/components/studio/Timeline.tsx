import React from 'react';
import { Clip } from '../../types/project';

export const Timeline: React.FC<{ clips: Clip[]; selectedId: string; onSelectClip: (id: string) => void }> = ({
  clips,
  selectedId,
  onSelectClip
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto p-3 bg-slate-900 rounded-lg border border-slate-800">
      {clips.map((clip) => (
        <button
          key={clip.id}
          onClick={() => onSelectClip(clip.id)}
          className={`px-4 py-2 rounded text-xs whitespace-nowrap ${selectedId === clip.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          {clip.title}
        </button>
      ))}
    </div>
  );
};
