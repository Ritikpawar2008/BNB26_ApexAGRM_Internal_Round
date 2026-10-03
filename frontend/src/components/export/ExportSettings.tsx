import React from 'react';
import { AspectFormat } from './FormatSelector';

interface ExportSettingsProps {
  format: AspectFormat;
  resolution?: string;
  bitrate?: string;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  format,
  resolution = '1080p',
  bitrate = '12 Mbps (High)',
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="st-eyebrow">Encoding & Output Specs</label>
        <span className="st-mono text-[11px] text-[var(--st-muted)]">FFmpeg Pipeline</span>
      </div>

      <div className="st-surface p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)]">Container</span>
          <span className="text-[14px] font-medium text-white block mt-1">MP4 (MPEG-4)</span>
          <span className="st-mono text-[11px] text-white/40 block mt-0.5">libx264</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)]">Resolution</span>
          <span className="text-[14px] font-medium text-white block mt-1">
            {format === '9:16' ? '1080 × 1920' : format === '1:1' ? '1080 × 1080' : '1920 × 1080'}
          </span>
          <span className="st-mono text-[11px] text-white/40 block mt-0.5">{resolution}</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)]">Audio Track</span>
          <span className="text-[14px] font-medium text-white block mt-1">AAC Stereo</span>
          <span className="st-mono text-[11px] text-emerald-400 block mt-0.5">Normalized -14 LUFS</span>
        </div>
        <div>
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)]">Target Bitrate</span>
          <span className="text-[14px] font-medium text-white block mt-1">{bitrate}</span>
          <span className="st-mono text-[11px] text-white/40 block mt-0.5">Variable (VBR)</span>
        </div>
      </div>
    </div>
  );
};
