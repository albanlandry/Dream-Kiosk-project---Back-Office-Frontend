import apiClient from './client';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  owner: string;
  status: 'active' | 'revoked' | 'expired' | 'blacklisted';
  ipWhitelist?: string[];
  rateLimit?: {
    requests: number;
    window: string;
    burst?: number;
  };
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  parentKeyId?: string;
  permissions?: ApiKeyPermission[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApiKeyPermission {
  id: string;
  path: string;
  matchType: 'exact' | 'prefix' | 'wildcard' | 'regex';
  httpMethods: string[];
  includeSubpaths: boolean;
  allowedSubpaths?: string[];
  allow: boolean;
  exclusions?: string[];
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  owner: string;
  permissions?: Omit<ApiKeyPermission, 'id'>[];
  ipWhitelist?: string[];
  rateLimit?: {
    requests: number;
    window: string;
    burst?: number;
  };
  expiresAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  owner?: string;
  permissions?: Omit<ApiKeyPermission, 'id'>[];
  ipWhitelist?: string[];
  rateLimit?: {
    requests: number;
    window: string;
    burst?: number;
  };
  expiresAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApiKeyListResponse {
  data: ApiKey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiKeyUsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsPerDay: Array<{ date: string; count: number }>;
  lastUsedAt: string | null;
  actionsBreakdown: Array<{ action: string; count: number }>;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  apiKeyId?: string;
  metadata: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
}

export interface SecurityDashboard {
  totalAlerts: number;
  unacknowledgedAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  recentAlerts: SecurityAlert[];
}

export const apiKeysApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    owner?: string;
    search?: string;
    tags?: string[];
  }): Promise<ApiKeyListResponse> => {
    const response = await apiClient.get<ApiKeyListResponse>('/api-keys', { params });
    return response.data;
  },

  get: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.get<{ data: ApiKey }>(`/api-keys/${id}`);
    return response.data.data;
  },

  create: async (data: CreateApiKeyRequest): Promise<{ apiKey: ApiKey; key: string }> => {
    const response = await apiClient.post<{ data: { apiKey: ApiKey; key: string } }>('/api-keys', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateApiKeyRequest): Promise<ApiKey> => {
    const response = await apiClient.put<{ data: ApiKey }>(`/api-keys/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`, { params: { hardDelete } });
  },

  revoke: async (id: string, reason: string, scheduledAt?: string): Promise<ApiKey> => {
    const response = await apiClient.post<{ data: ApiKey }>(`/api-keys/${id}/revoke`, {
      reason,
      scheduledAt,
    });
    return response.data.data;
  },

  blacklist: async (id: string, reason?: string, until?: string): Promise<ApiKey> => {
    const response = await apiClient.post<{ data: ApiKey }>(`/api-keys/${id}/blacklist`, {
      reason,
      until,
    });
    return response.data.data;
  },

  unblacklist: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.post<{ data: ApiKey }>(`/api-keys/${id}/unblacklist`);
    return response.data.data;
  },

  getUsageStatistics: async (id: string): Promise<ApiKeyUsageStatistics> => {
    const response = await apiClient.get<{ data: ApiKeyUsageStatistics }>(`/api-keys/${id}/usage`);
    return response.data.data;
  },

  getSecurityDashboard: async (apiKeyId?: string): Promise<SecurityDashboard> => {
    const response = await apiClient.get<{ data: SecurityDashboard }>('/api-keys/security/dashboard', {
      params: { apiKeyId },
    });
    return response.data.data;
  },

  getSecurityAlerts: async (apiKeyId?: string, limit: number = 50): Promise<SecurityAlert[]> => {
    const response = await apiClient.get<{ data: SecurityAlert[] }>('/api-keys/security/alerts', {
      params: { apiKeyId, limit },
    });
    return response.data.data;
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await apiClient.post(`/api-keys/security/alerts/${alertId}/acknowledge`);
  },

  bulkRevoke: async (ids: string[], reason: string): Promise<void> => {
    await apiClient.post('/api-keys/bulk/revoke', { ids, reason });
  },

  bulkDelete: async (ids: string[], hardDelete: boolean = false): Promise<void> => {
    await apiClient.post('/api-keys/bulk/delete', { ids, hardDelete });
  },

  bulkBlacklist: async (ids: string[], reason?: string): Promise<void> => {
    await apiClient.post('/api-keys/bulk/blacklist', { ids, reason });
  },
};

