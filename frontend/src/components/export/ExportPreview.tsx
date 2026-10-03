import React from 'react';

export const ExportPreview: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="aspect-[9/16] max-w-[280px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl">
      <video src={url} controls className="w-full h-full object-cover" />
    </div>
  );
};
