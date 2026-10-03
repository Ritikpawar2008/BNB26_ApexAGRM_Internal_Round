import { useState, useEffect } from 'react';
import { ProjectDetail } from '../types/project';
import { projectService } from '../services/projectService';

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getProject(projectId).then((p) => {
      setProject(p);
      setLoading(false);
    });
  }, [projectId]);

  return { project, loading };
}
