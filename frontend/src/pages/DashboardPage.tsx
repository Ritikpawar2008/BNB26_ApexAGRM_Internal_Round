import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MOCK_PROJECT } from '../data/mockData';
import { Plus, Video } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer
      title="Creator Dashboard"
      subtitle="Manage your video projects and AI-generated clips"
      action={
        <Link to="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to={`/projects/${MOCK_PROJECT.id}/studio`}>
          <Card className="hover:ring-2 hover:ring-indigo-500/50 transition-all">
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4 text-slate-600">
              <Video className="w-10 h-10 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">{MOCK_PROJECT.name}</h3>
              <Badge variant="success" text={MOCK_PROJECT.status} />
            </div>
            <p className="text-xs text-slate-400">3 AI Clips Generated • 92s duration</p>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
};
