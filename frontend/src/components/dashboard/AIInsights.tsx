import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export const AIInsights: React.FC = () => {
  const insights = [
    {
      id: 1,
      icon: Zap,
      text: "3 strong short-form moments detected in your latest upload.",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      id: 2,
      icon: TrendingUp,
      text: "Your 'Python Tutorial' video has high educational content potential.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      id: 3,
      icon: Sparkles,
      text: "2 clips from recent projects are highly suitable for TikTok/Reels.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-slate-100">AI Insights</h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className="flex gap-4 items-start p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className={`p-2 rounded-lg ${insight.bg} ${insight.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-300 leading-snug pt-1.5">
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
