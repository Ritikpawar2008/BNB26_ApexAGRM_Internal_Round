import React from 'react';
import { cn } from '../common/utils';

export interface UploadProgressProps {
  progress: number;
  label?: string;
  className?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  progress, 
  label = "Uploading...",
  className 
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} 
        />
      </div>
    </div>
  );
};
