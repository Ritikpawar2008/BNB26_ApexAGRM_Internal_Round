import { useState } from 'react';

export function useVideoPlayback() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return { currentTime, setCurrentTime, isPlaying, setIsPlaying };
}
