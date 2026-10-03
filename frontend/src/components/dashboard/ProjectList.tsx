import React from 'react';
import { Project } from '../../types/project';
import { ProjectCard } from './ProjectCard';

export const ProjectList: React.FC<{ projects: Project[]; onSelectProject: (id: string) => void }> = ({
  projects,
  onSelectProject
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onSelect={() => onSelectProject(p.id)} />
      ))}
    </div>
  );
};
