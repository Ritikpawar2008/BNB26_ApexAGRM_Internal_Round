import React from 'react';

export interface PlatformConfig {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  aspectRecommendation: '9:16' | '1:1' | '16:9';
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram Reels',
    subtitle: '9:16 · Feed & Explore · Safe zones respected',
    badge: 'Reels',
    aspectRecommendation: '9:16',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    subtitle: '9:16 · High-retention audio sync · FYP tuned',
    badge: 'FYP',
    aspectRecommendation: '9:16',
  },
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    subtitle: '9:16 · Algorithm optimized hooks & title tags',
    badge: 'Shorts',
    aspectRecommendation: '9:16',
  },
];

interface PlatformSelectorProps {
  selectedPlatform: string;
  onSelectPlatform: (id: string) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelectPlatform,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="st-eyebrow">Target Destination</label>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">Platform Presets</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PLATFORMS.map((plat) => {
          const isSelected = selectedPlatform === plat.id;
          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => onSelectPlatform(plat.id)}
              className={`p-5 rounded-[20px] text-left border transition-all duration-300 relative flex flex-col justify-between h-[120px] ${
                isSelected
                  ? 'border-[var(--st-text)] bg-[var(--st-surface-2)] shadow-lg'
                  : 'border-[var(--st-line)] bg-[var(--st-surface)] hover:border-[var(--st-line-strong)]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[15px] font-medium text-white">{plat.name}</span>
                <span
                  className={`text-[10px] st-mono px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'border-[#ff5a36] text-[#ff5a36] bg-[#ff5a36]/10'
                      : 'border-white/10 text-white/50'
                  }`}
                >
                  {plat.badge}
                </span>
              </div>
              <p className="text-[12px] text-[var(--st-muted)] leading-relaxed">{plat.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
