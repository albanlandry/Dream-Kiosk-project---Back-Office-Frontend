import apiClient from './client';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  admin: {
    admin_id: string;
    email: string;
    name: string;
    roles: string[];
    is_active: boolean;
    last_login_at?: string;
  };
}

export interface AdminProfile {
  admin_id: string;
  email: string;
  name: string;
  roles: string[];
  is_active: boolean;
  last_login_at?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>('/backoffice/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async (): Promise<AdminProfile> => {
    const response = await apiClient.get<{ data: AdminProfile }>('/backoffice/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<AdminProfile> => {
    const response = await apiClient.put<{ data: AdminProfile }>('/backoffice/auth/profile', data);
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/backoffice/auth/password', data);
  },

  getPermissions: async (): Promise<string[]> => {
    const response = await apiClient.get<{ data: string[] }>('/auth/permissions');
    return response.data.data || [];
  },
};

