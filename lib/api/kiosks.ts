import { apiClient } from './client';

export interface Kiosk {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  macAddress?: string;
  serialNumber?: string;
  description?: string;
  status: 'online' | 'offline' | 'warning';
  lastConnection?: string | Date;
  todayUsers?: number;
  todayRevenue?: number;
  errorReason?: string;
  projectId?: string;
  project?: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface KioskResponse {
  data: Kiosk | Kiosk[];
  _links?: Record<string, { href: string; method: string }>;
}

export const kiosksApi = {
  getAll: async (projectId?: string): Promise<Kiosk[]> => {
    const params = projectId ? { projectId } : undefined;
    const response = await apiClient.get<KioskResponse>('/kiosks', { params });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Kiosk> => {
    const response = await apiClient.get<KioskResponse>(`/kiosks/${id}`);
    return response.data?.data || response.data;
  },

  create: async (kiosk: {
    name: string;
    location: string;
    ipAddress: string;
    projectId: string;
    macAddress?: string;
    serialNumber?: string;
    description?: string;
  }): Promise<Kiosk> => {
    const response = await apiClient.post<KioskResponse>('/kiosks', kiosk);
    return response.data?.data || response.data;
  },

  update: async (
    id: string,
    kiosk: {
      name?: string;
      location?: string;
      ipAddress?: string;
      projectId?: string;
      macAddress?: string;
      serialNumber?: string;
      description?: string;
    },
  ): Promise<Kiosk> => {
    const response = await apiClient.patch<KioskResponse>(`/kiosks/${id}`, kiosk);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/kiosks/${id}`);
  },

  generateTestToken: async (id: string): Promise<{
    token: string;
    expiresIn: number;
    kioskId: string;
  }> => {
    const response = await apiClient.post<{
      data: {
        token: string;
        expiresIn: number;
        kioskId: string;
      };
    }>(`/kiosks/${id}/generate-token`);
    return response.data?.data || response.data;
  },
};

