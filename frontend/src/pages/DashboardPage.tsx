import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Loading } from '../components/common/Loading';
import { projectService } from '../services/projectService';
import { Project } from '../types/project';
import { Plus, Video, Search, Clock, ArrowRight } from 'lucide-react';


export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<{ status: string; ffmpeg: boolean; database: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [projectList, health] = await Promise.all([
          projectService.getProjects(),
          projectService.getHealth()
        ]);
        if (mounted) {
          setProjects(projectList);
          setBackendHealth(health);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'ready':
      case 'completed':
        return <Badge variant="success" text="Ready" />;
      case 'analyzing':
      case 'exporting':
        return <Badge variant="warning" text="Processing" />;
      case 'uploaded':
        return <Badge variant="accent" text="Uploaded" />;
      default:
        return <Badge variant="neutral" text={status || 'Idle'} />;
    }
  };

  return (
    <PageContainer
      title="Creator Dashboard"
      subtitle="Manage your long-form video archives and AI-generated social clips"
      action={
        <div className="flex items-center gap-3">
          {backendHealth && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#161718] border border-[#23252a] text-[11px] font-mono text-[#8a8f98]">
              <span className={`w-2 h-2 rounded-full ${backendHealth.database ? 'bg-[#27a644]' : 'bg-[#eb5757]'}`} />
              <span>Backend: {backendHealth.status}</span>
            </div>
          )}
          <Link to="/projects/new">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#62666d]" />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1011] border border-[#23252a] rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-[#ffffff] placeholder-[#62666d] focus:outline-none focus:border-[#8a8f98]"
          />
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-20">
            <Loading label="Loading projects from SQLite database..." />
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Upload your first long-form video to let Gemini detect viral moments and generate short clips."
            actionText="Create First Project"
            onAction={() => (window.location.href = '/projects/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}/studio`}>
                <Card className="hover:border-[#383b3f] transition-all duration-150 p-4 flex flex-col justify-between h-44 group">
                  <div>
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#e4f222] group-hover:border-[#383b3f] transition-colors">
                        <Video className="w-4 h-4" />
                      </div>
                      {getStatusBadge(p.status)}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-[#ffffff] tracking-tight group-hover:text-[#e4f222] transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                  </div>

                  {/* Bottom Meta */}
                  <div className="pt-3 border-t border-[#23252a]/60 flex items-center justify-between text-[11px] font-mono text-[#62666d]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[#8a8f98] group-hover:translate-x-0.5 transition-transform">
                      Open Studio <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
