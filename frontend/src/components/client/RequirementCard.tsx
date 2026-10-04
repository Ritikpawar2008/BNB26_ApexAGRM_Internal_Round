import React, { useState } from 'react';
import { Requirement, RequirementStatus } from '../../types/project';
import { Badge } from '../common/Badge';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, PlayCircle, Send } from 'lucide-react';

interface RequirementCardProps {
  requirement: Requirement;
  currentRole: 'editor' | 'client';
  onStatusChange: (id: string, status: RequirementStatus) => void;
  onAddComment: (id: string, text: string) => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  currentRole,
  onStatusChange,
  onAddComment
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const statusMap: Record<RequirementStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'danger'; icon: any }> = {
    open: { label: 'Open', variant: 'warning', icon: AlertCircle },
    in_progress: { label: 'In Progress', variant: 'info', icon: Clock },
    resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle2 },
    changes_requested: { label: 'Revision', variant: 'danger', icon: AlertCircle }
  };

  const currentStatus = statusMap[requirement.status] || statusMap.open;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(requirement.id, commentText);
    setCommentText('');
  };

  return (
    <div className="bg-[#0f1011] border border-[#23252a] hover:border-[#383b3f] rounded-[8px] p-4 transition-all duration-150">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-[#8a8f98] font-medium">{requirement.id}</span>
          <h4 className="text-sm font-medium text-[#ffffff] tracking-tight">{requirement.title}</h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={currentStatus.variant} text={currentStatus.label} />
          {currentRole === 'editor' && (
            <select
              value={requirement.status}
              onChange={(e) => onStatusChange(requirement.id, e.target.value as RequirementStatus)}
              className="bg-[#161718] border border-[#23252a] text-[#8a8f98] hover:text-[#d0d6e0] text-[11px] rounded-[4px] px-2 py-0.5 focus:outline-none focus:border-[#8a8f98] font-mono cursor-pointer"
            >
              <option value="open">Mark Open</option>
              <option value="in_progress">Mark In Progress</option>
              <option value="resolved">Mark Resolved</option>
              <option value="changes_requested">Request Changes</option>
            </select>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#8a8f98] mt-2 leading-relaxed">{requirement.description}</p>

      {/* Meta Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#23252a]/60 text-[11px] font-mono text-[#62666d]">
        <div className="flex items-center gap-3">
          {requirement.clipId && (
            <span className="flex items-center gap-1 text-[#02b8cc]">
              <PlayCircle className="w-3 h-3" />
              {requirement.clipId}
            </span>
          )}
          <span className={requirement.author === 'client' ? 'text-[#818cf8]' : 'text-[#e4f222]'}>
            by {requirement.authorName}
          </span>
          <span>{requirement.createdAt}</span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[#8a8f98] hover:text-[#d0d6e0] transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          <span>{requirement.comments.length} {requirement.comments.length === 1 ? 'comment' : 'comments'}</span>
        </button>
      </div>

      {/* Threaded Comments / Discussion */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[#23252a] space-y-3">
          <div className="space-y-2">
            {requirement.comments.length === 0 ? (
              <p className="text-xs text-[#62666d] italic py-1">No comments yet. Start the thread below.</p>
            ) : (
              requirement.comments.map((comment) => (
                <div key={comment.id} className="p-2.5 rounded-[6px] bg-[#161718] border border-[#23252a] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${comment.author === 'client' ? 'text-[#818cf8]' : 'text-[#e4f222]'}`}>
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-[#62666d] font-mono">{comment.createdAt}</span>
                  </div>
                  <p className="text-[#d0d6e0] leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder={`Reply as ${currentRole === 'client' ? 'Client' : 'Editor'}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-[#161718] border border-[#23252a] rounded-[6px] px-3 py-1.5 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-[6px] bg-[#23252a] hover:bg-[#383b3f] text-[#d0d6e0] text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
