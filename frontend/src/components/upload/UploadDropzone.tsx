import React from 'react';
import { UploadCloud } from 'lucide-react';

export const UploadDropzone: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => {
  return (
    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors">
      <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
      <p className="text-sm text-slate-300">Drag & drop your MP4/MOV file here</p>
    </div>
  );
};
