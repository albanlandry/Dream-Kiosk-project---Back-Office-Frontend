'use client';

import { useQuery } from '@tanstack/react-query';
import { ActivityLogsApi, type ActivityLogFilters, type ActivityLog } from '@/lib/api/activity-logs';

export const useActivityLogs = (
  filters?: ActivityLogFilters,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => ActivityLogsApi.query(filters || {}),
    refetchInterval: options?.refetchInterval ?? 30000, // Default: Refetch every 30 seconds
    enabled: options?.enabled !== false,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
};

/**
 * Hook to get recent activity logs for dashboard
 * Optimized for high performance with caching and automatic refresh
 * 
 * @param limit - Maximum number of activities to fetch (default: 10)
 * @param projectId - Optional project ID to filter activities. If provided, shows only activities related to that project.
 * @param options - Additional options for the query
 */
export const useRecentActivityLogs = (
  limit: number = 10,
  projectId?: string,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  const filters: ActivityLogFilters = {
    limit,
    page: 1,
    // Filter by project if provided - project activities use resourceType='project' and resourceId=projectId
    // If projectId is not provided, show all recent activities
    ...(projectId && {
      resourceType: 'project',
      resourceId: projectId,
    }),
  };

  return useActivityLogs(filters, {
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? 30000, // Refresh every 30 seconds
  });
};

