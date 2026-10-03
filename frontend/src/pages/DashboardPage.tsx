import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentProjects } from '../components/dashboard/RecentProjects';
import { AIInsights } from '../components/dashboard/AIInsights';
import { FileVideo, Scissors, Sparkles, HardDrive } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Welcome back, Creator 👋"
      subtitle="Here's what's happening with your projects today."
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Projects" 
          value={12} 
          icon={FileVideo} 
          trend={{ value: 15, isPositive: true }} 
        />
        <StatsCard 
          title="Generated Clips" 
          value={148} 
          icon={Scissors} 
          trend={{ value: 32, isPositive: true }} 
        />
        <StatsCard 
          title="AI Analyses" 
          value={24} 
          icon={Sparkles} 
        />
        <StatsCard 
          title="Assets Size" 
          value="4.2 GB" 
          icon={HardDrive} 
          trend={{ value: 2, isPositive: false }} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (takes 2/3 space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentProjects />
        </div>

        {/* Right Column (takes 1/3 space on large screens) */}
        <div className="space-y-6">
          <QuickActions />
          <AIInsights />
        </div>
      </div>
    </PageContainer>
  );
};
