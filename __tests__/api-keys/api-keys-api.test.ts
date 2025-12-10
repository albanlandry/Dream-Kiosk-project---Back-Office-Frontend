import { apiKeysApi } from '@/lib/api/api-keys';
import apiClient from '@/lib/api/client';

jest.mock('@/lib/api/client');

describe('API Keys API', () => {
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch API keys list with default params', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            total_pages: 0,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.list();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api-keys', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch API keys list with filters', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            total_pages: 0,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        limit: 10,
        status: 'active',
        owner: 'test@example.com',
        search: 'test',
      };

      await apiKeysApi.list(params);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api-keys', { params });
    });
  });

  describe('get', () => {
    it('should fetch a single API key', async () => {
      const mockKey = {
        id: 'test-id',
        name: 'Test Key',
        status: 'active',
        owner: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
      };

      const mockResponse = {
        data: {
          data: mockKey,
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.get('test-id');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api-keys/test-id');
      expect(result).toEqual(mockKey);
    });
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createData = {
        name: 'New Key',
        owner: 'test@example.com',
        permissions: [],
      };

      const mockResponse = {
        data: {
          data: {
            apiKey: {
              id: 'new-id',
              name: 'New Key',
              status: 'active',
              owner: 'test@example.com',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              version: 1,
            },
            key: 'sk_test_1234567890',
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.create(createData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api-keys', createData);
      expect(result.apiKey.id).toBe('new-id');
      expect(result.key).toBe('sk_test_1234567890');
    });
  });

  describe('update', () => {
    it('should update an API key', async () => {
      const updateData = {
        name: 'Updated Key',
      };

      const mockResponse = {
        data: {
          data: {
            id: 'test-id',
            name: 'Updated Key',
            status: 'active',
            owner: 'test@example.com',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
            version: 1,
          },
        },
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.update('test-id', updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/api-keys/test-id', updateData);
      expect(result.name).toBe('Updated Key');
    });
  });

  describe('delete', () => {
    it('should delete an API key', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: {} });

      await apiKeysApi.delete('test-id');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api-keys/test-id', {
        params: { hardDelete: false },
      });
    });

    it('should hard delete an API key', async () => {
      mockedApiClient.delete.mockResolvedValue({ data: {} });

      await apiKeysApi.delete('test-id', true);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api-keys/test-id', {
        params: { hardDelete: true },
      });
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'test-id',
            status: 'revoked',
            owner: 'test@example.com',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
            version: 1,
          },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.revoke('test-id', 'Test reason');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api-keys/test-id/revoke', {
        reason: 'Test reason',
        scheduledAt: undefined,
      });
      expect(result.status).toBe('revoked');
    });
  });

  describe('getUsageStatistics', () => {
    it('should fetch usage statistics', async () => {
      const mockStats = {
        totalRequests: 100,
        successfulRequests: 95,
        failedRequests: 5,
        requestsPerDay: [],
        lastUsedAt: '2024-01-01T00:00:00Z',
        actionsBreakdown: [],
      };

      const mockResponse = {
        data: {
          data: mockStats,
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.getUsageStatistics('test-id');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api-keys/test-id/usage');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getSecurityDashboard', () => {
    it('should fetch security dashboard data', async () => {
      const mockDashboard = {
        totalAlerts: 10,
        unacknowledgedAlerts: 5,
        alertsByType: {},
        alertsBySeverity: {},
        recentAlerts: [],
      };

      const mockResponse = {
        data: {
          data: mockDashboard,
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await apiKeysApi.getSecurityDashboard();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api-keys/security/dashboard', {
        params: { apiKeyId: undefined },
      });
      expect(result).toEqual(mockDashboard);
    });
  });

  describe('bulk operations', () => {
    it('should bulk revoke API keys', async () => {
      mockedApiClient.post.mockResolvedValue({ data: {} });

      await apiKeysApi.bulkRevoke(['id1', 'id2'], 'Test reason');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api-keys/bulk/revoke', {
        ids: ['id1', 'id2'],
        reason: 'Test reason',
      });
    });

    it('should bulk delete API keys', async () => {
      mockedApiClient.post.mockResolvedValue({ data: {} });

      await apiKeysApi.bulkDelete(['id1', 'id2'], true);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api-keys/bulk/delete', {
        ids: ['id1', 'id2'],
        hardDelete: true,
      });
    });

    it('should bulk blacklist API keys', async () => {
      mockedApiClient.post.mockResolvedValue({ data: {} });

      await apiKeysApi.bulkBlacklist(['id1', 'id2'], 'Test reason');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api-keys/bulk/blacklist', {
        ids: ['id1', 'id2'],
        reason: 'Test reason',
      });
    });
  });
});

