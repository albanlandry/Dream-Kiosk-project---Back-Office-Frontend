import apiClient from './client';
import type { Statistics } from '@/types';

export interface StatisticsFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export interface StatisticsWithCharts extends Statistics {
  revenueChart?: {
    labels: string[];
    values: number[];
  };
  contentChart?: {
    labels: string[];
    values: number[];
  };
}

export const statisticsApi = {
  getStatistics: async (filters?: StatisticsFilters): Promise<Statistics> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.projectId) params.append('projectId', filters.projectId);

    const queryString = params.toString();
    const url = `/backoffice/statistics${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<{ data: Statistics }>(url);
    return response.data.data;
  },
};

