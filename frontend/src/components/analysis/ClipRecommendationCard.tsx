import React from 'react';
import { Card } from '../common/Card';

export const ClipRecommendationCard: React.FC<{ title: string; hook: string }> = ({ title, hook }) => {
  return (
    <Card>
      <h5 className="font-semibold text-white">{title}</h5>
      <p className="text-xs text-slate-400">{hook}</p>
    </Card>
  );
};
