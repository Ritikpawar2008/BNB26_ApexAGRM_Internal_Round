import React from 'react';

export const HookCard: React.FC<{ hook: string }> = ({ hook }) => {
  return <div className="p-3 bg-slate-900 rounded border border-slate-700 text-sm text-indigo-300">{hook}</div>;
};
