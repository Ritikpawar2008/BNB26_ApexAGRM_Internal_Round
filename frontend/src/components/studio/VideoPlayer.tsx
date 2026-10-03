import React from 'react';

interface VideoPlayerProps {
  src?: string;
  onTimeUpdate?: (curr: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onTimeUpdate }) => {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <video
        src={src}
        controls
        className="w-full max-h-[400px]"
        onTimeUpdate={(e) => onTimeUpdate && onTimeUpdate(e.currentTarget.currentTime)}
      />
    </div>
  );
};
