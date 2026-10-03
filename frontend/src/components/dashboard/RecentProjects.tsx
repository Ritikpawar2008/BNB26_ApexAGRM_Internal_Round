import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Video, Clock, ChevronRight } from 'lucide-react';
import { ProjectDetail } from '../../types/project';

const MOCK_RECENT_PROJECTS: ProjectDetail[] = [
  {
    id: "proj_1",
    name: "AI Explained for Beginners",
    status: "ready",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-03T14:30:00Z",
    clips: [{} as any, {} as any, {} as any] // Mocking 3 clips
  },
  {
    id: "proj_2",
    name: "Python Tutorial: Async/Await",
    status: "analyzing",
    created_at: "2026-10-02T09:15:00Z",
    updated_at: "2026-10-03T18:45:00Z",
    clips: []
  },
  {
    id: "proj_3",
    name: "Tech Trends 2026",
    status: "completed",
    created_at: "2026-09-28T16:20:00Z",
    updated_at: "2026-09-29T11:10:00Z",
    clips: [{} as any, {} as any, {} as any, {} as any, {} as any] // 5 clips
  }
];

export const RecentProjects: React.FC = () => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ready':
      case 'completed':
        return <Badge variant="success" text="Completed" />;
      case 'analyzing':
      case 'uploading':
        return <Badge variant="warning" text="Processing" />;
      case 'idle':
        return <Badge variant="info" text="Draft" />;
      default:
        return <Badge variant="default" text={status} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Recent Projects</h3>
        <Button variant="ghost" size="sm" className="text-slate-400">View All</Button>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_RECENT_PROJECTS.map(project => (
          <div 
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}/studio`)}
            className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </span>
                  <span>•</span>
                  <span>{project.clips.length} clips</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(project.status)}
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
