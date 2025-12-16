import { apiClient } from './client';

export interface ContentPC {
  id: string;
  name: string;
  projectId: string | null;
  project?: {
    id: string;
    name: string;
  };
  ipAddress?: string;
  displayCount: number;
  status: 'online' | 'offline' | 'maintenance';
  lastConnectedAt?: string | Date;
  currentScheduleId?: string | null;
  waitingScheduleCount?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkStatus?: string;
  autoStart?: boolean;
  updateInterval?: number;
  volume?: number;
  brightness?: number;
  displayMode?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateContentPCDto {
  name: string;
  projectId: string;
  ipAddress?: string;
  displayCount?: number;
  autoStart?: boolean;
  updateInterval?: number;
  volume?: number;
  brightness?: number;
  displayMode?: string;
}

export interface UpdateContentPCDto {
  name?: string;
  projectId?: string;
  ipAddress?: string;
  displayCount?: number;
  autoStart?: boolean;
  updateInterval?: number;
  volume?: number;
  brightness?: number;
  displayMode?: string;
}

export interface ContentPCResources {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStatus: string;
}

export const contentPcsApi = {
  getAll: async (projectId?: string): Promise<ContentPC[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get('/schedules/content-pcs', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ContentPC> => {
    const response = await apiClient.get(`/schedules/content-pcs/${id}`);
    return response.data?.data || response.data;
  },

  create: async (dto: CreateContentPCDto): Promise<ContentPC> => {
    const response = await apiClient.post('/schedules/content-pcs', dto);
    return response.data?.data || response.data;
  },

  update: async (id: string, dto: UpdateContentPCDto): Promise<ContentPC> => {
    const response = await apiClient.put(`/schedules/content-pcs/${id}`, dto);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/content-pcs/${id}`);
  },

  attachToProject: async (id: string, projectId: string): Promise<ContentPC> => {
    const response = await apiClient.post(`/schedules/content-pcs/${id}/attach`, { projectId });
    return response.data?.data || response.data;
  },

  detachFromProject: async (id: string): Promise<ContentPC> => {
    const response = await apiClient.post(`/schedules/content-pcs/${id}/detach`);
    return response.data?.data || response.data;
  },

  start: async (id: string): Promise<ContentPC> => {
    const response = await apiClient.post(`/schedules/content-pcs/${id}/start`);
    return response.data?.data || response.data;
  },

  restart: async (id: string): Promise<ContentPC> => {
    const response = await apiClient.post(`/schedules/content-pcs/${id}/restart`);
    return response.data?.data || response.data;
  },

  getResources: async (id: string): Promise<ContentPCResources> => {
    const response = await apiClient.get(`/schedules/content-pcs/${id}/resources`);
    return response.data?.data || response.data;
  },

  updateSettings: async (id: string, settings: Partial<ContentPC>): Promise<ContentPC> => {
    const response = await apiClient.put(`/schedules/content-pcs/${id}/settings`, settings);
    return response.data?.data || response.data;
  },

  requestRepair: async (id: string): Promise<ContentPC> => {
    const response = await apiClient.post(`/schedules/content-pcs/${id}/repair`);
    return response.data?.data || response.data;
  },
};

