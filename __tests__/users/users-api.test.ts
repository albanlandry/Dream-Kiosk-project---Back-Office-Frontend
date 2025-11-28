/**
 * Tests for User CRUD Operations
 * Tests user creation, reading, updating, and deletion
 */

import { usersApi, type User, type CreateUserRequest, type UpdateUserRequest } from '@/lib/api/users';
import apiClient from '@/lib/api/client';

// Mock the API client
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

describe('Users API - CRUD Operations', () => {
  const mockUser: User = {
    id: '1',
    userId: 'user001',
    name: 'Test User',
    email: 'test@example.com',
    phone: '010-1234-5678',
    department: '개발팀',
    role: 'user',
    status: 'active',
    joinDate: '2024-01-01',
    lastLogin: '2024-12-22 14:30',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET Operations', () => {
    it('should fetch all users', async () => {
      const mockResponse = {
        data: {
          items: [mockUser],
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await usersApi.getAll();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/backoffice/admins', {
        params: undefined,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockUser);
    });

    it('should fetch users with pagination', async () => {
      const mockResponse = {
        data: {
          items: [mockUser],
          total_count: 1,
          page: 2,
          limit: 10,
          total_pages: 1,
        },
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await usersApi.getAll({ page: 2, limit: 10 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/backoffice/admins', {
        params: { page: 2, limit: 10 },
      });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should fetch users with filters', async () => {
      const mockResponse = {
        data: {
          items: [mockUser],
          total_count: 1,
          page: 1,
          limit: 20,
          total_pages: 1,
        },
      };

      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await usersApi.getAll({
        search: 'test',
        role: 'user',
        status: 'active',
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/backoffice/admins', {
        params: { search: 'test', role: 'user', status: 'active' },
      });
      expect(result.items).toHaveLength(1);
    });

    it('should fetch user by ID', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { data: mockUser } });

      const result = await usersApi.getById('1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/backoffice/admins/1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('CREATE Operations', () => {
    it('should create a new user', async () => {
      const createRequest: CreateUserRequest = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        role: 'user',
        phone: '010-1234-5678',
        department: '개발팀',
      };

      mockedApiClient.post.mockResolvedValue({ data: { data: mockUser } });

      const result = await usersApi.create(createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/backoffice/admins', createRequest);
      expect(result).toEqual(mockUser);
    });

    it('should create user with all fields', async () => {
      const createRequest: CreateUserRequest = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        role: 'admin',
        status: 'active',
        phone: '010-1234-5678',
        department: '개발팀',
        memo: 'Test memo',
        permissions: {
          read: true,
          write: true,
          admin: true,
        },
      };

      mockedApiClient.post.mockResolvedValue({ data: { data: mockUser } });

      await usersApi.create(createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/backoffice/admins', createRequest);
    });
  });

  describe('UPDATE Operations', () => {
    it('should update user information', async () => {
      const updateRequest: UpdateUserRequest = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateRequest };
      mockedApiClient.patch.mockResolvedValue({ data: { data: updatedUser } });

      const result = await usersApi.update('1', updateRequest);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/backoffice/admins/1', updateRequest);
      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
    });

    it('should update user role', async () => {
      const updatedUser = { ...mockUser, role: 'admin' as const };
      mockedApiClient.put.mockResolvedValue({ data: { data: updatedUser } });

      const result = await usersApi.updateRole('1', 'admin');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/backoffice/admins/1/role', {
        role: 'admin',
      });
      expect(result.role).toBe('admin');
    });
  });

  describe('DELETE Operations', () => {
    it('should delete a user', async () => {
      mockedApiClient.delete.mockResolvedValue(undefined);

      await usersApi.delete('1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/backoffice/admins/1');
    });
  });
});

