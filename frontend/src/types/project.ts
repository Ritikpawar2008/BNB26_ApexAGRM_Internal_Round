export interface Project {
  id: string;
  name: string;
  status: 'idle' | 'uploading' | 'uploaded' | 'analyzing' | 'ready' | 'exporting' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  filename: string;
  url: string;
  duration: number;
  file_size?: number;
}

export interface Clip {
  id: string;
  position: number;
  start_time: number;
  end_time: number;
  title: string;
  reason?: string;
  hook: string;
  caption: string;
  confidence: number;
  url?: string;
  is_selected: boolean;
}

export interface ProjectDetail extends Project {
  asset?: Asset;
  clips: Clip[];
}

export type RequirementStatus = 'open' | 'in_progress' | 'resolved' | 'changes_requested';
export type RequirementPriority = 'low' | 'normal' | 'urgent';

export interface RequirementComment {
  id: string;
  requirementId: string;
  author: 'client' | 'editor';
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  clipId?: string; // Optional tag for specific clip
  status: RequirementStatus;
  priority: RequirementPriority;
  author: 'client' | 'editor';
  authorName: string;
  comments: RequirementComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWorkLog {
  id: string;
  projectId: string;
  category: 'upload' | 'ai' | 'ffmpeg' | 'editor' | 'client' | 'export';
  title: string;
  details: string;
  actor: string;
  timestamp: string;
  commitHash?: string;
}

