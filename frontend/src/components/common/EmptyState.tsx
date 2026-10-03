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
    <div className="text-center py-12 px-4 border border-dashed border-slate-700 rounded-xl">
      <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      {actionText && onAction && <Button onClick={onAction}>{actionText}</Button>}
    </div>
  );
};
