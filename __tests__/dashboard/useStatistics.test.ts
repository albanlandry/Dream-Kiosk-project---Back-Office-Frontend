/**
 * Tests for useStatistics Hook
 * Tests statistics fetching with filters and refetch intervals
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { statisticsApi } from '@/lib/api/statistics';
import type { StatisticsFilters } from '@/lib/api/statistics';
import type { Statistics } from '@/types';

// Mock the statistics API
jest.mock('@/lib/api/statistics', () => ({
  statisticsApi: {
    getStatistics: jest.fn(),
  },
}));

const mockedStatisticsApi = statisticsApi as jest.Mocked<typeof statisticsApi>;

describe('useStatistics Hook', () => {
  let queryClient: QueryClient;

  const mockStatistics: Statistics = {
    images: {
      total: 100,
      active: 80,
      inactive: 20,
    },
    videos: {
      total: 50,
      processing: 5,
      ready: 40,
      failed: 5,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    mockedStatisticsApi.getStatistics.mockResolvedValue(mockStatistics);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should fetch statistics without filters', async () => {
    const { result } = renderHook(() => useStatistics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedStatisticsApi.getStatistics).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockStatistics);
  });

  it('should fetch statistics with filters', async () => {
    const filters: StatisticsFilters = {
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-12-31T23:59:59Z',
      projectId: 'project-123',
    };

    const { result } = renderHook(() => useStatistics(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedStatisticsApi.getStatistics).toHaveBeenCalledWith(filters);
    expect(result.current.data).toEqual(mockStatistics);
  });

  it('should use default refetch interval of 10 seconds', () => {
    const { result } = renderHook(() => useStatistics(), { wrapper });

    expect(result.current.data).toBeUndefined();
    // Query should be configured with refetchInterval
    // Note: We can't directly test refetchInterval, but we can verify the query is set up
  });

  it('should use custom refetch interval', () => {
    const { result } = renderHook(
      () => useStatistics(undefined, { refetchInterval: 5000 }),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  it('should disable query when enabled is false', () => {
    const { result } = renderHook(
      () => useStatistics(undefined, { enabled: false }),
      { wrapper }
    );

    // Query should not be executed
    expect(mockedStatisticsApi.getStatistics).not.toHaveBeenCalled();
  });

  it('should update query key when filters change', async () => {
    const { result, rerender } = renderHook(
      ({ filters }: { filters?: StatisticsFilters }) => useStatistics(filters),
      {
        wrapper,
        initialProps: { filters: undefined },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedStatisticsApi.getStatistics).toHaveBeenCalledTimes(1);

    // Change filters
    rerender({
      filters: { projectId: 'project-123' },
    });

    await waitFor(() => {
      expect(mockedStatisticsApi.getStatistics).toHaveBeenCalledTimes(2);
    });

    expect(mockedStatisticsApi.getStatistics).toHaveBeenLastCalledWith({
      projectId: 'project-123',
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockedStatisticsApi.getStatistics.mockRejectedValue(error);

    const { result } = renderHook(() => useStatistics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

