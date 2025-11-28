import apiClient from './client';

export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  memo?: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  password: string;
  role: 'admin' | 'user' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  memo?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: 'admin' | 'user' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  memo?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

export interface UserListResponse {
  items: User[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get<{ data: UserListResponse }>('/backoffice/admins', {
      params,
    });
    return response.data?.data || response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ data: User }>(`/backoffice/admins/${id}`);
    return response.data?.data || response.data;
  },

  create: async (user: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<{ data: User }>('/backoffice/admins', user);
    return response.data?.data || response.data;
  },

  update: async (id: string, user: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<{ data: User }>(`/backoffice/admins/${id}`, user);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/backoffice/admins/${id}`);
  },

  activate: async (id: string): Promise<User> => {
    const response = await apiClient.put<{ data: User }>(`/backoffice/admins/${id}/activate`);
    return response.data?.data || response.data;
  },

  suspend: async (id: string): Promise<User> => {
    const response = await apiClient.put<{ data: User }>(`/backoffice/admins/${id}/suspend`);
    return response.data?.data || response.data;
  },

  updateRole: async (id: string, role: 'admin' | 'user' | 'viewer'): Promise<User> => {
    const response = await apiClient.put<{ data: User }>(`/backoffice/admins/${id}/role`, {
      role,
    });
    return response.data?.data || response.data;
  },
};

