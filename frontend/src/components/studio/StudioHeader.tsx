import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { StudioButton } from './StudioButton';

export type SaveState = 'clean' | 'dirty' | 'saving' | 'saved';

interface StudioHeaderProps {
  projectName: string;
  saveState: SaveState;
  onSave: () => void;
  onExport: () => void;
}

const STATE_LABEL: Record<SaveState, string> = {
  clean: 'AI draft ready',
  dirty: 'Unsaved edits',
  saving: 'Saving…',
  saved: 'All changes saved',
};

export const StudioHeader: React.FC<StudioHeaderProps> = ({ projectName, saveState, onSave, onExport }) => (
  <header className="flex items-center justify-between gap-6 py-6 border-b st-hairline">
    <div className="flex items-center gap-4 min-w-0">
      <span className="text-[15px] font-semibold tracking-tight">
        Creator<span className="text-[var(--st-accent)]">AI</span>
      </span>
      <span className="text-[var(--st-faint)]">/</span>
      <span className="st-eyebrow hidden sm:inline">Studio</span>
      <span className="text-[var(--st-faint)] hidden sm:inline">/</span>
      <span className="text-[15px] text-[var(--st-muted)] truncate">{projectName}</span>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <span className="hidden md:inline-flex items-center gap-2 mr-2 text-[13px] text-[var(--st-muted)]">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            saveState === 'dirty' ? 'bg-[var(--st-accent)] st-pulse' : 'bg-emerald-400'
          }`}
        />
        {STATE_LABEL[saveState]}
      </span>
      <StudioButton onClick={onSave} disabled={saveState === 'saving' || saveState === 'clean' || saveState === 'saved'}>
        Save
      </StudioButton>
      <StudioButton variant="primary" onClick={onExport} icon={<ArrowUpRight className="w-4 h-4" />}>
        Continue to Export
      </StudioButton>
    </div>
  </header>
);
