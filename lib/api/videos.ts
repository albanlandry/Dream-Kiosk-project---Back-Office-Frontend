import apiClient from './client';
import type { Video, PaginatedResponse } from '@/types';

export type VideoStatus = 'processing' | 'ready' | 'failed';

export const videosApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: VideoStatus;
  }): Promise<PaginatedResponse<Video>> => {
    const response = await apiClient.get<PaginatedResponse<Video>>('/backoffice/videos', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Video> => {
    const response = await apiClient.get<{ data: Video }>(`/backoffice/videos/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, status: VideoStatus): Promise<Video> => {
    const response = await apiClient.put<{ data: Video }>(`/backoffice/videos/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  updatePriority: async (id: string, priority: number): Promise<Video> => {
    const response = await apiClient.put<{ data: Video }>(`/backoffice/videos/${id}/priority`, {
      priority,
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/backoffice/videos/${id}`);
  },
};

