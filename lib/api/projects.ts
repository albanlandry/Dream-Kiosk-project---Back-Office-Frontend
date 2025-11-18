import { apiClient } from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  startDate: string | Date;
  endDate?: string | Date;
  location: string;
  owner: string;
  totalContent: number;
  totalRevenue: number;
  kiosks?: Array<{ id: string; name: string }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProjectResponse {
  data: Project | Project[];
  _links?: Record<string, { href: string; method: string }>;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>('/projects');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/${id}`);
    return response.data?.data || response.data;
  },

  create: async (project: {
    name: string;
    description?: string;
    location: string;
    owner: string;
    startDate: string;
    endDate?: string;
    status?: 'active' | 'paused' | 'stopped';
  }): Promise<Project> => {
    const response = await apiClient.post<ProjectResponse>('/projects', project);
    return response.data?.data || response.data;
  },

  update: async (
    id: string,
    project: {
      name?: string;
      description?: string;
      location?: string;
      owner?: string;
      startDate?: string;
      endDate?: string;
      status?: 'active' | 'paused' | 'stopped';
    },
  ): Promise<Project> => {
    const response = await apiClient.patch<ProjectResponse>(`/projects/${id}`, project);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

