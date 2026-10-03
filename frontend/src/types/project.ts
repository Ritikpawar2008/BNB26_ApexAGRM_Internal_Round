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
