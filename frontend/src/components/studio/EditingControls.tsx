import React from 'react';
import { Clip } from '../../types/project';

export const EditingControls: React.FC<{ clip: Clip; onUpdate: (updated: Partial<Clip>) => void }> = ({
  clip,
  onUpdate
}) => {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={clip.hook}
        onChange={(e) => onUpdate({ hook: e.target.value })}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
      />
    </div>
  );
};
