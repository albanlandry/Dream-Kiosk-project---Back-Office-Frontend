import apiClient from './client';
import type { Statistics } from '@/types';

export const statisticsApi = {
  getStatistics: async (): Promise<Statistics> => {
    const response = await apiClient.get<{ data: Statistics }>('/backoffice/statistics');
    return response.data.data;
  },
};

