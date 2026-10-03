import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../common/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, className }) => {
  return (
    <Card className={cn("p-6 flex flex-col justify-center", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-slate-100">{value}</span>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("font-medium", trend.isPositive ? "text-emerald-400" : "text-rose-400")}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 ml-2">from last month</span>
        </div>
      )}
    </Card>
  );
};
