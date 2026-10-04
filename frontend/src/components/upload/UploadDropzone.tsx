import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export const UploadDropzone: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-[#23252a] hover:border-[#383b3f] bg-[#0f1011] rounded-[12px] p-8 text-center cursor-pointer transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <UploadCloud className="w-10 h-10 text-[#e4f222] mx-auto mb-3" />
      <p className="text-xs text-[#d0d6e0]">Drag & drop or click to upload MP4/MOV</p>
    </div>
  );
};

