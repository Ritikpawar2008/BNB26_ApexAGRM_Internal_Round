import React from 'react';

export const CaptionCard: React.FC<{ caption: string }> = ({ caption }) => {
  return <div className="p-3 bg-slate-900 rounded border border-slate-700 text-sm text-slate-300">{caption}</div>;
};
