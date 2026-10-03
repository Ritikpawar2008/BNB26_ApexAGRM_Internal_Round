import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../common/utils';

export interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ 
  onFileSelect, 
  accept = "video/*", 
  label = "Drag & drop your file here", 
  sublabel = "Supports MP4, MOV, WebM",
  className 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center",
        isDragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-800/50",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept={accept} 
        onChange={handleChange} 
      />
      <UploadCloud className={cn("w-12 h-12 mx-auto mb-4", isDragActive ? "text-indigo-400" : "text-slate-400")} />
      <h3 className="text-base font-medium text-slate-200 mb-1">{label}</h3>
      <p className="text-sm text-slate-500">{sublabel}</p>
    </div>
  );
};
