import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Clip } from '../../types/project';
import { formatSecondsToTime } from '../../utils/timeFormatter';
import { StudioButton } from '../studio/StudioButton';

interface ExportCompleteProps {
  projectId: string;
  clips: Clip[];
  format: string;
  platformName: string;
  downloadUrl?: string;
  onReset: () => void;
}

const pad = (n: number) => n.toString().padStart(2, '0');

export const ExportComplete: React.FC<ExportCompleteProps> = ({
  projectId,
  clips,
  format,
  platformName,
  downloadUrl,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const totalDuration = Math.round(clips.reduce((sum, c) => sum + (c.end_time - c.start_time), 0));

  const handleCopyCaptions = () => {
    const text = clips
      .map(
        (c, i) =>
          `Clip ${pad(i + 1)} · ${c.title}\nHOOK: "${c.hook}"\nCAPTION: ${c.caption}\nDURATION: ${Math.round(c.end_time - c.start_time)}s\n`
      )
      .join('\n────────────────────────────\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `creator_ai_${projectId}_${format}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="st-surface p-10 md:p-16 text-center max-w-3xl mx-auto border-[var(--st-line-strong)] shadow-2xl relative overflow-hidden st-rise">
      {/* Calm ambient background light */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Subtle status tag */}
        <p className="st-eyebrow !text-emerald-400 flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>PRODUCTION MASTER READY</span>
        </p>

        {/* Large Editorial Headline */}
        <h2 className="st-display text-[46px] md:text-[76px] text-white tracking-tight">
          Your content is ready.
        </h2>

        <p className="text-[15px] text-[var(--st-muted)] max-w-md mt-2 font-normal">
          {pad(clips.length)} clips stitched and reframed for {platformName} ({format}).
        </p>

        {/* Finished Creative Artifact Card */}
        <div className="w-full max-w-md my-8 p-6 rounded-[24px] bg-[var(--st-surface-2)] border st-hairline text-left">
          <div className="flex items-center justify-between pb-4 border-b st-hairline">
            <span className="st-eyebrow !text-[10px]">Master File</span>
            <span className="st-mono text-[11px] text-emerald-400">1080 × 1920 MP4</span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div>
              <span className="st-eyebrow !text-[10px] block">Clips</span>
              <span className="st-mono text-[18px] text-white mt-1 block">{pad(clips.length)}</span>
            </div>
            <div>
              <span className="st-eyebrow !text-[10px] block">Runtime</span>
              <span className="st-mono text-[18px] text-white mt-1 block">{formatSecondsToTime(totalDuration)}</span>
            </div>
            <div>
              <span className="st-eyebrow !text-[10px] block">Audio</span>
              <span className="st-mono text-[18px] text-white mt-1 block">-14 LUFS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {downloadUrl ? (
            <StudioButton
              variant="primary"
              onClick={handleDownload}
              className="w-full sm:w-auto"
              icon={<Download className="w-4 h-4" />}
            >
              Download Stitched MP4
            </StudioButton>
          ) : (
            <div className="w-full sm:w-auto">
              <StudioButton
                variant="primary"
                onClick={handleCopyCaptions}
                className="w-full"
                icon={<Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Captions & Hooks'}
              </StudioButton>
            </div>
          )}

          {downloadUrl && (
            <StudioButton
              onClick={handleCopyCaptions}
              className="w-full sm:w-auto"
              icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy Copywriting'}
            </StudioButton>
          )}

          <button
            type="button"
            onClick={onReset}
            className="st-btn st-btn--ghost w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Export Again</span>
          </button>
        </div>

        {!downloadUrl && (
          <p className="mt-4 text-[12px] st-mono text-[var(--st-muted)]">
            * Backend demo mode: Captions & sequence ready for publishing
          </p>
        )}

        {/* Return to Studio Link */}
        <div className="mt-8 pt-6 border-t st-hairline w-full max-w-md">
          <Link
            to={ROUTES.STUDIO(projectId)}
            className="inline-flex items-center gap-2 text-xs text-[var(--st-muted)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
