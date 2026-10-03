import { MOCK_PROJECT } from '../data/mockData';
import { Project, ProjectDetail, Clip } from '../types/project';
import { USE_MOCK, API_BASE_URL } from './apiClient';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    if (USE_MOCK) return [MOCK_PROJECT];
    const res = await fetch(`${API_BASE_URL}/projects`);
    const json = await res.json();
    return json.data;
  },

  getProject: async (id: string): Promise<ProjectDetail> => {
    if (USE_MOCK) return MOCK_PROJECT;
    const res = await fetch(`${API_BASE_URL}/projects/${id}`);
    const json = await res.json();
    return json.data;
  },

  createProject: async (name: string): Promise<Project> => {
    if (USE_MOCK) return { ...MOCK_PROJECT, name, id: 'proj_' + Date.now() };
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    return json.data;
  },

  updateClips: async (id: string, clips: Clip[]): Promise<boolean> => {
    if (USE_MOCK) return true;
    const res = await fetch(`${API_BASE_URL}/projects/${id}/clips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clips }),
    });
    const json = await res.json();
    return json.success;
  }
};
