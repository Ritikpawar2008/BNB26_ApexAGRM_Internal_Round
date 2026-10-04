import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Smartphone, Monitor } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  startTime?: number;
  endTime?: number;
  onTimeUpdate?: (curr: number) => void;
  aspectMode?: '16:9' | '9:16';
  onAspectChange?: (mode: '16:9' | '9:16') => void;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  startTime = 0,
  endTime = 0,
  onTimeUpdate,
  aspectMode = '16:9',
  onAspectChange,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [isLooping, setIsLooping] = useState(true);

  // When clip changes, seek to startTime
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [startTime, src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    onTimeUpdate?.(curr);

    // If we reach the end of the clip, loop or pause
    if (endTime > startTime && curr >= endTime) {
      if (isLooping) {
        videoRef.current.currentTime = startTime;
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col bg-[#0f1011] border border-[#23252a] rounded-[12px] overflow-hidden">
      {/* Top Player Header: Aspect Ratio Mode & Clip Title */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#23252a] bg-[#161718]/60">
        <span className="text-xs font-medium text-[#d0d6e0] truncate max-w-xs font-mono">
          {title || 'Clip Preview'}
        </span>

        {onAspectChange && (
          <div className="flex items-center gap-1 bg-[#08090a] p-0.5 rounded-[6px] border border-[#23252a]">
            <button
              onClick={() => onAspectChange('16:9')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono transition-colors ${
                aspectMode === '16:9'
                  ? 'bg-[#161718] text-[#ffffff] border border-[#23252a]'
                  : 'text-[#8a8f98] hover:text-[#d0d6e0]'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => onAspectChange('9:16')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono transition-colors ${
                aspectMode === '9:16'
                  ? 'bg-[#161718] text-[#e4f222] border border-[#23252a]'
                  : 'text-[#8a8f98] hover:text-[#d0d6e0]'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16 Canvas</span>
            </button>
          </div>
        )}
      </div>

      {/* Video Viewport Container */}
      <div className="relative bg-black flex items-center justify-center min-h-[320px] max-h-[460px] overflow-hidden select-none">
        {src ? (
          <div
            className={`transition-all duration-300 flex items-center justify-center relative ${
              aspectMode === '9:16'
                ? 'w-[258px] h-[460px] bg-[#08090a] border-x border-[#23252a]'
                : 'w-full h-full'
            }`}
          >
            <video
              ref={videoRef}
              src={src}
              className={`max-h-[460px] ${aspectMode === '9:16' ? 'w-full object-cover' : 'w-full object-contain'}`}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              playsInline
            />

            {/* 9:16 Safe-Zone Overlay Overlay Guides */}
            {aspectMode === '9:16' && (
              <div className="absolute inset-0 pointer-events-none border border-dashed border-[#e4f222]/20 flex flex-col justify-between p-3">
                <div className="text-[10px] font-mono text-[#e4f222]/60 bg-black/40 px-1.5 py-0.5 rounded self-center">
                  Top Subtitle Safe Area
                </div>
                <div className="text-[10px] font-mono text-[#8a8f98]/60 bg-black/40 px-1.5 py-0.5 rounded self-center">
                  UI Safe Zone (TikTok/Reels)
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-xs text-[#62666d] font-mono">
            No video loaded. Select a clip to preview.
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#23252a] bg-[#161718]/40">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-[6px] bg-[#e4f222] text-[#08090a] flex items-center justify-center hover:bg-[#d8e519] transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button
            onClick={handleRestart}
            className="w-7 h-7 rounded-[6px] bg-[#23252a] text-[#d0d6e0] flex items-center justify-center hover:bg-[#383b3f] transition-colors"
            title="Restart Clip"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-2 py-1 rounded-[4px] text-[11px] font-mono transition-colors ${
              isLooping ? 'bg-[#27a644]/15 text-[#27a644] border border-[#27a644]/30' : 'text-[#62666d]'
            }`}
          >
            Loop {isLooping ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Timecodes */}
        <div className="text-xs font-mono text-[#8a8f98]">
          <span className="text-[#ffffff]">{currentTime.toFixed(1)}s</span>
          <span className="text-[#62666d]"> / {endTime.toFixed(1)}s</span>
          <span className="text-[#62666d] text-[10px] ml-2">({Math.max(0, endTime - startTime).toFixed(1)}s total)</span>
        </div>
      </div>
    </div>
  );
};
