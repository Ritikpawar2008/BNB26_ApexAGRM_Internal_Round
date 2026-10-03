import React from 'react';

export const AnalysisStatus: React.FC<{ status: string }> = ({ status }) => {
  return <div className="text-sm text-slate-300">Current status: {status}</div>;
};
