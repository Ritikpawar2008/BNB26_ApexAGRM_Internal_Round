import React from 'react';
import { ProjectWorkLog } from '../../types/project';
import { Sparkles, Video, Scissors, UserCheck, MessageSquare, Download, GitCommit } from 'lucide-react';

interface ProjectWorkLogProps {
  logs: ProjectWorkLog[];
}

export const ProjectWorkLogTimeline: React.FC<ProjectWorkLogProps> = ({ logs }) => {
  const getCategoryIcon = (category: ProjectWorkLog['category']) => {
    switch (category) {
      case 'upload':
        return <Video className="w-3.5 h-3.5 text-[#02b8cc]" />;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-[#e4f222]" />;
      case 'ffmpeg':
        return <Scissors className="w-3.5 h-3.5 text-[#818cf8]" />;
      case 'editor':
        return <UserCheck className="w-3.5 h-3.5 text-[#27a644]" />;
      case 'client':
        return <MessageSquare className="w-3.5 h-3.5 text-[#6366f1]" />;
      case 'export':
        return <Download className="w-3.5 h-3.5 text-[#e4f222]" />;
      default:
        return <GitCommit className="w-3.5 h-3.5 text-[#8a8f98]" />;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#62666d] font-mono">
        No project work activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#23252a]">
      {logs.map((log) => (
        <div key={log.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#0f1011] border border-[#23252a] flex items-center justify-center group-hover:border-[#8a8f98] transition-colors">
            {getCategoryIcon(log.category)}
          </div>

          {/* Log Entry Content */}
          <div className="bg-[#0f1011] border border-[#23252a] hover:border-[#383b3f] rounded-[8px] p-3 transition-all duration-150">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-medium text-[#ffffff]">{log.title}</span>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#62666d]">
                {log.commitHash && (
                  <span className="text-[#8a8f98] bg-[#161718] px-1.5 py-0.5 rounded-[3px] border border-[#23252a]">
                    #{log.commitHash}
                  </span>
                )}
                <span>{log.timestamp}</span>
              </div>
            </div>

            <p className="text-xs text-[#8a8f98] leading-relaxed mb-2">{log.details}</p>

            <div className="text-[10px] font-mono text-[#62666d] flex items-center gap-1.5">
              <span>Actor:</span>
              <span className="text-[#d0d6e0]">{log.actor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
