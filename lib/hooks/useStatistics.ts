'use client';

import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api/statistics';

export const useStatistics = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: statisticsApi.getStatistics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

