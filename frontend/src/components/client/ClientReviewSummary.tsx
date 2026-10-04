import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CheckCircle2, Clock, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface ClientReviewSummaryProps {
  totalDuration: number;
  clipsCount: number;
  avgConfidence: number;
  isApproved: boolean;
  onApprove: () => void;
  onRequestRevision: () => void;
  currentRole: 'editor' | 'client';
}

export const ClientReviewSummary: React.FC<ClientReviewSummaryProps> = ({
  totalDuration,
  clipsCount,
  avgConfidence,
  isApproved,
  onApprove,
  onRequestRevision,
  currentRole
}) => {
  return (
    <Card className="mb-6 border-[#23252a] bg-[#0f1011]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <div className="p-3 rounded-[6px] bg-[#161718] border border-[#23252a]">
            <div className="flex items-center gap-1.5 text-xs text-[#8a8f98] mb-1">
              <Clock className="w-3.5 h-3.5 text-[#02b8cc]" />
              <span>Raw Footage</span>
            </div>
            <div className="text-base font-semibold text-[#ffffff] font-mono">
              {Math.round(totalDuration)}s
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#161718] border border-[#23252a]">
            <div className="flex items-center gap-1.5 text-xs text-[#8a8f98] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#e4f222]" />
              <span>Clips Extracted</span>
            </div>
            <div className="text-base font-semibold text-[#ffffff] font-mono">
              {clipsCount} Shorts
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#161718] border border-[#23252a]">
            <div className="flex items-center gap-1.5 text-xs text-[#8a8f98] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#27a644]" />
              <span>AI Match Score</span>
            </div>
            <div className="text-base font-semibold text-[#27a644] font-mono">
              {Math.round(avgConfidence * 100)}%
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#161718] border border-[#23252a]">
            <div className="flex items-center gap-1.5 text-xs text-[#8a8f98] mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#818cf8]" />
              <span>Manual Time Saved</span>
            </div>
            <div className="text-base font-semibold text-[#818cf8] font-mono">
              ~3.5 hrs
            </div>
          </div>
        </div>

        {/* Right: Client Action Center */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {isApproved ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#27a644]/10 border border-[#27a644]/30 text-[#27a644] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Project Approved by Client</span>
            </div>
          ) : (
            <>
              {currentRole === 'client' && (
                <>
                  <Button variant="outline" size="sm" onClick={onRequestRevision} className="w-full sm:w-auto">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-[#e4f222]" />
                    Request Revision
                  </Button>
                  <Button variant="primary" size="sm" onClick={onApprove} className="w-full sm:w-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Approve Video
                  </Button>
                </>
              )}
              {currentRole === 'editor' && (
                <div className="text-right">
                  <Badge variant="warning" text="Awaiting Client Review" />
                  <p className="text-[11px] text-[#62666d] mt-1 font-mono">Client can file revision requirements</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
