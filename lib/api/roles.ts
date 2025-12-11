import apiClient from './client';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
}

export interface RoleListResponse {
  data: Role[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PermissionListResponse {
  data: Permission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface CreatePermissionRequest {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export const rolesApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<RoleListResponse> => {
    const response = await apiClient.get('/roles', { params });
    const responseData = response.data?.data || response.data;

    if (responseData && typeof responseData === 'object' && 'data' in responseData && 'pagination' in responseData) {
      const pagination = responseData.pagination as any;
      return {
        data: responseData.data || [],
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 20,
          total: pagination.total || 0,
          total_pages: pagination.totalPages || pagination.total_pages || 1,
        },
      };
    }

    return {
      data: Array.isArray(responseData) ? responseData : [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        total_pages: 1,
      },
    };
  },

  get: async (id: string): Promise<Role> => {
    const response = await apiClient.get<{ data: Role }>(`/roles/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await apiClient.post<{ data: Role }>('/roles', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
    const response = await apiClient.put<{ data: Role }>(`/roles/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

export const permissionsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    resource?: string;
    action?: string;
  }): Promise<PermissionListResponse> => {
    const response = await apiClient.get('/permissions', { params });
    const responseData = response.data?.data || response.data;

    if (responseData && typeof responseData === 'object' && 'data' in responseData && 'pagination' in responseData) {
      const pagination = responseData.pagination as any;
      return {
        data: responseData.data || [],
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 20,
          total: pagination.total || 0,
          total_pages: pagination.totalPages || pagination.total_pages || 1,
        },
      };
    }

    return {
      data: Array.isArray(responseData) ? responseData : [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 0,
        total_pages: 1,
      },
    };
  },

  get: async (id: string): Promise<Permission> => {
    const response = await apiClient.get<{ data: Permission }>(`/permissions/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreatePermissionRequest): Promise<Permission> => {
    const response = await apiClient.post<{ data: Permission }>('/permissions', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdatePermissionRequest): Promise<Permission> => {
    const response = await apiClient.put<{ data: Permission }>(`/permissions/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/permissions/${id}`);
  },
};

