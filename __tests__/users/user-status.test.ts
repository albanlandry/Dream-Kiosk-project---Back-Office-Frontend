/**
 * Tests for User Status Management
 * Tests enabling and disabling users
 */

import { usersApi, type User } from '@/lib/api/users';
import apiClient from '@/lib/api/client';

jest.mock('@/lib/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Users API - Status Management', () => {
  const mockActiveUser: User = {
    id: '1',
    userId: 'user001',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2024-12-22 14:30',
  };

  const mockInactiveUser: User = {
    ...mockActiveUser,
    status: 'inactive',
  };

  const mockSuspendedUser: User = {
    ...mockActiveUser,
    status: 'suspended',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Activate User', () => {
    it('should activate an inactive user', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockActiveUser } });

      const result = await usersApi.activate('1');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/backoffice/admins/1/activate');
      expect(result.status).toBe('active');
    });

    it('should activate a suspended user', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockActiveUser } });

      const result = await usersApi.activate('1');

      expect(result.status).toBe('active');
    });

    it('should handle activation errors', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('User not found'));

      await expect(usersApi.activate('999')).rejects.toThrow('User not found');
    });
  });

  describe('Suspend User', () => {
    it('should suspend an active user', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockSuspendedUser } });

      const result = await usersApi.suspend('1');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/backoffice/admins/1/suspend');
      expect(result.status).toBe('suspended');
    });

    it('should handle suspension errors', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('User not found'));

      await expect(usersApi.suspend('999')).rejects.toThrow('User not found');
    });
  });

  describe('Status Transitions', () => {
    it('should transition from inactive to active', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockActiveUser } });

      const result = await usersApi.activate('1');

      expect(result.status).toBe('active');
    });

    it('should transition from active to suspended', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockSuspendedUser } });

      const result = await usersApi.suspend('1');

      expect(result.status).toBe('suspended');
    });

    it('should transition from suspended to active', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { data: mockActiveUser } });

      const result = await usersApi.activate('1');

      expect(result.status).toBe('active');
    });
  });

  describe('Update Status via Update', () => {
    it('should update user status to inactive', async () => {
      const updatedUser = { ...mockActiveUser, status: 'inactive' as const };
      mockedApiClient.patch.mockResolvedValue({ data: { data: updatedUser } });

      const result = await usersApi.update('1', { status: 'inactive' });

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/backoffice/admins/1', {
        status: 'inactive',
      });
      expect(result.status).toBe('inactive');
    });

    it('should update user status to suspended', async () => {
      const updatedUser = { ...mockActiveUser, status: 'suspended' as const };
      mockedApiClient.patch.mockResolvedValue({ data: { data: updatedUser } });

      const result = await usersApi.update('1', { status: 'suspended' });

      expect(result.status).toBe('suspended');
    });
  });
});

