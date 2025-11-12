import apiClient from './client';
import type { Image, PaginatedResponse } from '@/types';

export const imagesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    active_only?: boolean;
  }): Promise<PaginatedResponse<Image>> => {
    const response = await apiClient.get<PaginatedResponse<Image>>('/backoffice/images', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Image> => {
    const response = await apiClient.get<{ data: Image }>(`/backoffice/images/${id}`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/backoffice/images/${id}`);
  },

  toggleActive: async (id: string): Promise<Image> => {
    const response = await apiClient.put<{ data: Image }>(`/backoffice/images/${id}/toggle-active`);
    return response.data.data;
  },
};

