import React, { useState, useEffect } from 'react';
import { Clip } from '../../types/project';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Copy, Check, Sparkles, MessageSquare } from 'lucide-react';

interface EditingControlsProps {
  clip: Clip;
  onUpdate: (updated: Partial<Clip>) => void;
  onSaveToBackend: () => void;
  isSaving?: boolean;
  currentRole: 'editor' | 'client';
  onRequestRevisionForClip?: (clipId: string) => void;
}

export const EditingControls: React.FC<EditingControlsProps> = ({
  clip,
  onUpdate,
  onSaveToBackend,
  isSaving = false,
  currentRole,
  onRequestRevisionForClip
}) => {
  const [hookText, setHookText] = useState(clip.hook || '');
  const [captionText, setCaptionText] = useState(clip.caption || '');
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  useEffect(() => {
    setHookText(clip.hook || '');
    setCaptionText(clip.caption || '');
  }, [clip.id, clip.hook, clip.caption]);

  const handleHookBlur = () => {
    if (hookText !== clip.hook) {
      onUpdate({ hook: hookText });
    }
  };

  const handleCaptionBlur = () => {
    if (captionText !== clip.caption) {
      onUpdate({ caption: captionText });
    }
  };

  const copyToClipboard = (text: string, isHook: boolean) => {
    navigator.clipboard.writeText(text);
    if (isHook) {
      setCopiedHook(true);
      setTimeout(() => setCopiedHook(false), 2000);
    } else {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-[#0f1011] border-[#23252a]">
      {/* Title & Virality Reason */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-[#ffffff] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#e4f222]" />
            Hook & Caption Inspector
          </h3>
          {currentRole === 'client' && onRequestRevisionForClip && (
            <button
              onClick={() => onRequestRevisionForClip(clip.id)}
              className="text-[11px] font-mono text-[#818cf8] hover:underline flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              File Revision on this Clip
            </button>
          )}
        </div>
        {clip.reason && (
          <p className="text-xs text-[#8a8f98] italic border-l-2 border-[#23252a] pl-2.5 py-0.5 mt-2">
            "{clip.reason}"
          </p>
        )}
      </div>

      {/* Opening Verbal Hook */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-[#ffffff] flex items-center gap-1.5">
            <span>Opening Verbal Hook</span>
            <span className="text-[10px] font-mono text-[#62666d]">({hookText.length} chars)</span>
          </label>
          <button
            onClick={() => copyToClipboard(hookText, true)}
            className="text-[11px] font-mono text-[#8a8f98] hover:text-[#d0d6e0] flex items-center gap-1"
          >
            {copiedHook ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedHook ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          disabled={currentRole === 'client'}
          value={hookText}
          onChange={(e) => setHookText(e.target.value)}
          onBlur={handleHookBlur}
          placeholder="Enter punchy verbal hook to capture viewers in first 3 seconds..."
          className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
        />
      </div>

      {/* Social Media Caption */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-[#ffffff] flex items-center gap-1.5">
            <span>Social Media Caption & Tags</span>
            <span className="text-[10px] font-mono text-[#62666d]">({captionText.length} chars)</span>
          </label>
          <button
            onClick={() => copyToClipboard(captionText, false)}
            className="text-[11px] font-mono text-[#8a8f98] hover:text-[#d0d6e0] flex items-center gap-1"
          >
            {copiedCaption ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea
          rows={3}
          disabled={currentRole === 'client'}
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          onBlur={handleCaptionBlur}
          placeholder="Ready-to-post caption with hashtags..."
          className="w-full bg-[#08090a] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98] resize-none disabled:opacity-75 disabled:cursor-not-allowed"
        />
      </div>

      {/* Action Footer */}
      {currentRole === 'editor' && (
        <div className="flex items-center justify-between pt-2 border-t border-[#23252a]">
          <span className="text-[10px] font-mono text-[#62666d]">
            SQLite Persistence: <span className="text-[#27a644]">Live Active</span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveToBackend}
            isLoading={isSaving}
          >
            Save All Changes
          </Button>
        </div>
      )}
    </Card>
  );
};
