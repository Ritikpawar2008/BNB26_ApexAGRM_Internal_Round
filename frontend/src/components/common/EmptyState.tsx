import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionText, onAction }) => {
  return (
    <div className="text-center py-12 px-6 border border-dashed border-[#23252a] rounded-[12px] bg-[#0f1011]/50">
      <FolderOpen className="w-10 h-10 text-[#62666d] mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-[#ffffff] mb-1">{title}</h3>
      <p className="text-xs text-[#8a8f98] max-w-sm mx-auto mb-4">{description}</p>
      {actionText && onAction && <Button variant="primary" size="sm" onClick={onAction}>{actionText}</Button>}
    </div>
  );
};

