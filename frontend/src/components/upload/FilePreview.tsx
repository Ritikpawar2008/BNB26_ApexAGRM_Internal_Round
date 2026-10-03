import React from 'react';
import { X, FileVideo, FileText } from 'lucide-react';
import { Button } from '../common/Button';

export interface FilePreviewProps {
  file: File;
  type?: 'video' | 'script';
  onClear: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, type = 'video', onClear }) => {
  const Icon = type === 'video' ? FileVideo : FileText;
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-lg">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="uppercase">{file.name.split('.').pop() || type}</span>
            <span>•</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        className="text-slate-400 hover:text-rose-400 shrink-0 ml-4"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
