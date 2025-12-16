'use client';

import { useQuery } from '@tanstack/react-query';
import { statisticsApi, type StatisticsFilters } from '@/lib/api/statistics';

export const useStatistics = (filters?: StatisticsFilters, options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['statistics', filters],
    queryFn: () => statisticsApi.getStatistics(filters),
    refetchInterval: options?.refetchInterval ?? 10000, // Default: Refetch every 10 seconds for real-time updates
    enabled: options?.enabled !== false,
  });
};

