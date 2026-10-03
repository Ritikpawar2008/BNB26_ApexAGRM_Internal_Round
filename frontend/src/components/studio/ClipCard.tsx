import React from 'react';
import { Clip } from '../../types/project';
import { Card } from '../common/Card';

export const ClipCard: React.FC<{ clip: Clip; isSelected: boolean; onSelect: () => void }> = ({
  clip,
  isSelected,
  onSelect
}) => {
  return (
    <Card onClick={onSelect} className={isSelected ? 'border-indigo-500' : ''}>
      <h4 className="text-white text-sm font-medium">{clip.title}</h4>
      <p className="text-xs text-slate-400">{clip.start_time}s - {clip.end_time}s</p>
    </Card>
  );
};
