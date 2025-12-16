/**
 * Tests for Statistics API
 * Tests statistics fetching with filters (date range, project)
 */

import { statisticsApi, type StatisticsFilters } from '@/lib/api/statistics';
import apiClient from '@/lib/api/client';
import type { Statistics } from '@/types';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Statistics API', () => {
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
    jest.clearAllMocks();
  });

  describe('getStatistics', () => {
    it('should fetch statistics without filters', async () => {
      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStatistics },
      });

      const result = await statisticsApi.getStatistics();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/backoffice/statistics');
      expect(result).toEqual(mockStatistics);
    });

    it('should fetch statistics with startDate filter', async () => {
      const filters: StatisticsFilters = {
        startDate: '2025-01-01T00:00:00Z',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStatistics },
      });

      const result = await statisticsApi.getStatistics(filters);

      const callUrl = mockedApiClient.get.mock.calls[0][0] as string;
      expect(callUrl).toContain('/backoffice/statistics');
      expect(callUrl).toContain('startDate=2025-01-01');
      expect(result).toEqual(mockStatistics);
    });

    it('should fetch statistics with endDate filter', async () => {
      const filters: StatisticsFilters = {
        endDate: '2025-12-31T23:59:59Z',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStatistics },
      });

      const result = await statisticsApi.getStatistics(filters);

      const callUrl = mockedApiClient.get.mock.calls[0][0] as string;
      expect(callUrl).toContain('/backoffice/statistics');
      expect(callUrl).toContain('endDate=2025-12-31');
      expect(result).toEqual(mockStatistics);
    });

    it('should fetch statistics with projectId filter', async () => {
      const filters: StatisticsFilters = {
        projectId: 'project-123',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStatistics },
      });

      const result = await statisticsApi.getStatistics(filters);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/backoffice/statistics?projectId=project-123'
      );
      expect(result).toEqual(mockStatistics);
    });

    it('should fetch statistics with all filters', async () => {
      const filters: StatisticsFilters = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        projectId: 'project-123',
      };

      mockedApiClient.get.mockResolvedValue({
        data: { data: mockStatistics },
      });

      const result = await statisticsApi.getStatistics(filters);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/backoffice/statistics?')
      );
      const callUrl = mockedApiClient.get.mock.calls[0][0] as string;
      expect(callUrl).toContain('startDate=2025-01-01');
      expect(callUrl).toContain('endDate=2025-12-31');
      expect(callUrl).toContain('projectId=project-123');
      expect(result).toEqual(mockStatistics);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(statisticsApi.getStatistics()).rejects.toThrow('API Error');
    });
  });
});

