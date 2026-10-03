import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Clip } from '../../types/project';

interface ExportDetailsProps {
  clip: Clip;
  index: number;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const ExportDetails: React.FC<ExportDetailsProps> = ({ clip, index }) => {
  const [copied, setCopied] = useState(false);
  const hookWords = clip.hook.trim() ? clip.hook.trim().split(/\s+/).length : 0;
  const readSeconds = Math.max(1, Math.round(hookWords / 3.2));
  const hashtags = clip.caption.match(/#[\p{L}\d_]+/gu) ?? [];

  const handleCopy = () => {
    const text = `HOOK:\n${clip.hook}\n\nCAPTION:\n${clip.caption}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="st-eyebrow">Accompanying Copy · Clip {pad(index)}</label>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-[11px] st-mono text-[var(--st-muted)] hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Copywriting</span>
            </>
          )}
        </button>
      </div>

      <div className="st-surface p-6 flex flex-col gap-5">
        {/* Hook */}
        <div>
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)] mb-2">Verbal Hook</span>
          <div className="border-l-2 border-[#ff5a36] pl-4">
            <p className="text-[20px] font-light leading-snug text-white tracking-tight">
              “{clip.hook}”
            </p>
          </div>
          <span className="st-mono text-[11px] text-[var(--st-muted)] block mt-2 pl-4">
            {clip.hook.length} characters · ~{readSeconds}s spoken pace
          </span>
        </div>

        {/* Caption */}
        <div className="pt-4 border-t st-hairline">
          <span className="st-eyebrow !text-[10px] block text-[var(--st-muted)] mb-2">Social Caption</span>
          <p className="text-[14px] leading-relaxed text-white/90 font-normal">
            {clip.caption}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px] st-mono text-[var(--st-muted)]">
            <span>{hashtags.length} hashtags detected</span>
            <span>{clip.caption.length} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
};
