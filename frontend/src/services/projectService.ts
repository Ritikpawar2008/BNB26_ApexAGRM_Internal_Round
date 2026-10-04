import { MOCK_PROJECT } from '../data/mockData';
import { Project, ProjectDetail, Clip } from '../types/project';
import { USE_MOCK, API_BASE_URL, MEDIA_BASE_URL } from './apiClient';

export interface UploadResponse {
  asset_id: string;
  project_id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  duration: number;
  status: string;
}

export interface AnalyzeResponse {
  project_id: string;
  status: string;
  summary: string;
  clips_count: number;
}

export interface ExportResponse {
  export_id: string;
  project_id: string;
  status: string;
  download_url: string;
  total_duration: number;
}

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    if (USE_MOCK) return [MOCK_PROJECT];
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock projects', err);
      return [MOCK_PROJECT];
    }
  },

  getProject: async (id: string): Promise<ProjectDetail> => {
    if (USE_MOCK) return MOCK_PROJECT;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      const proj = json.data;
      // Normalize media URLs so they point to backend server
      if (proj && proj.asset && proj.asset.url && !proj.asset.url.startsWith('http')) {
        proj.asset.url = `${MEDIA_BASE_URL}${proj.asset.url.startsWith('/') ? '' : '/'}${proj.asset.url}`;
      }
      if (proj && proj.clips) {
        proj.clips = proj.clips.map((c: Clip) => {
          if (c.url && !c.url.startsWith('http')) {
            c.url = `${MEDIA_BASE_URL}${c.url.startsWith('/') ? '' : '/'}${c.url}`;
          }
          return c;
        });
      }
      return proj;
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock project', err);
      return { ...MOCK_PROJECT, id };
    }
  },

  createProject: async (name: string): Promise<Project> => {
    if (USE_MOCK) return { ...MOCK_PROJECT, name, id: 'proj_' + Date.now() };
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Backend unavailable, creating local project stub', err);
      return { ...MOCK_PROJECT, name, id: 'proj_' + Date.now() };
    }
  },

  uploadVideo: async (projectId: string, file: File): Promise<UploadResponse> => {
    if (USE_MOCK) {
      return {
        asset_id: 'asset_' + Date.now(),
        project_id: projectId,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type || 'video/mp4',
        duration: 90.0,
        status: 'uploaded',
      };
    }
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Upload failed with status ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  analyzeProject: async (projectId: string): Promise<AnalyzeResponse> => {
    if (USE_MOCK) {
      return {
        project_id: projectId,
        status: 'ready',
        summary: 'Demo analysis: Educational walkthrough on transformers.',
        clips_count: 3,
      };
    }
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Analysis failed with status ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  updateClips: async (id: string, clips: Clip[]): Promise<boolean> => {
    if (USE_MOCK) return true;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/clips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.warn('Backend unavailable, skipped remote clip update', err);
      return true;
    }
  },

  exportProject: async (
    projectId: string,
    format: string = '9:16',
    resolution: string = '1080p'
  ): Promise<ExportResponse> => {
    if (USE_MOCK) {
      return {
        export_id: 'exp_' + Date.now(),
        project_id: projectId,
        status: 'ready',
        download_url: '/storage/exports/demo_export.mp4',
        total_duration: 35.0,
      };
    }
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, resolution }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Export failed with status ${res.status}`);
    }
    const json = await res.json();
    const data = json.data;
    if (data.download_url && !data.download_url.startsWith('http')) {
      data.download_url = `${MEDIA_BASE_URL}${data.download_url.startsWith('/') ? '' : '/'}${data.download_url}`;
    }
    return data;
  },

  getHealth: async (): Promise<{ status: string; ffmpeg: boolean; database: boolean }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return { status: 'offline', ffmpeg: false, database: false };
      return await res.json();
    } catch {
      return { status: 'offline', ffmpeg: false, database: false };
    }
  }
};

