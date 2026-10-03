import React from 'react';
import { Clip } from '../../types/project';

export const AIRecommendationPanel: React.FC<{ clips: Clip[] }> = ({ clips }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase text-slate-400 font-semibold tracking-wider">AI Suggestions</h3>
      {clips.map((c) => (
        <div key={c.id} className="p-3 bg-slate-800/80 rounded border border-slate-700 text-xs text-slate-200">
          {c.title}
        </div>
      ))}
    </div>
  );
};
