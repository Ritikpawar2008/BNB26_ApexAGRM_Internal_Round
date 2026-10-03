import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Project } from '../../types/project';

export const ProjectCard: React.FC<{ project: Project; onSelect: () => void }> = ({ project, onSelect }) => {
  return (
    <Card onClick={onSelect}>
      <h4 className="text-white font-semibold">{project.name}</h4>
      <Badge text={project.status} />
    </Card>
  );
};
