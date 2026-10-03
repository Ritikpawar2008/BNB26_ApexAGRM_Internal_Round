import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Clip } from '../../types/project';
import { StudioButton } from '../studio/StudioButton';

export type ExportStatus = 'idle' | 'exporting' | 'completed';

interface ExportHeaderProps {
  projectId: string;
  projectName: string;
  status: ExportStatus;
  clipCount: number;
  clips?: Clip[];
  onExport: () => void;
}

export const ExportHeader: React.FC<ExportHeaderProps> = ({
  projectId,
  projectName,
  status,
  clipCount,
  clips,
  onExport,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 py-6 border-b st-hairline">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-[15px] font-semibold tracking-tight">
          Creator<span className="text-[var(--st-accent)]">AI</span>
        </span>
        <span className="text-[var(--st-faint)]">/</span>
        <Link
          to={ROUTES.STUDIO(projectId)}
          state={{ clips }}
          className="inline-flex items-center gap-1.5 text-[14px] text-[var(--st-muted)] hover:text-[var(--st-text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Studio</span>
        </Link>
        <span className="text-[var(--st-faint)] hidden sm:inline">/</span>
        <span className="st-eyebrow hidden sm:inline">Export</span>
        <span className="text-[var(--st-faint)] hidden md:inline">/</span>
        <span className="text-[14px] text-[var(--st-muted)] truncate hidden md:inline">{projectName}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-2 mr-2 text-[13px] text-[var(--st-muted)]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'exporting'
                ? 'bg-[var(--st-accent)] st-pulse'
                : status === 'completed'
                ? 'bg-emerald-400'
                : 'bg-indigo-400'
            }`}
          />
          {status === 'exporting'
            ? 'Rendering FFmpeg…'
            : status === 'completed'
            ? 'Export ready'
            : 'Ready to export'}
        </span>

        <Link to={ROUTES.STUDIO(projectId)} state={{ clips }}>
          <StudioButton>Back to Studio</StudioButton>
        </Link>

        {status !== 'completed' && (
          <StudioButton
            variant="primary"
            onClick={onExport}
            disabled={status === 'exporting'}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            {status === 'exporting' ? 'Exporting…' : `Export ${clipCount} Clips`}
          </StudioButton>
        )}
      </div>
    </header>
  );
};
