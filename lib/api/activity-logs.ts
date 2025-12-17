import { apiClient } from './client';

export interface ActivityLog {
  id: string;
  category: string;
  action: string;
  subCategory?: string;
  level: 'critical' | 'error' | 'warn' | 'info' | 'debug';
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  userId?: string;
  adminId?: string;
  sessionId?: string;
  kioskId?: string;
  contentPcId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceType?: string;
  location?: string;
  resourceType?: string;
  resourceId?: string;
  resourceMetadata?: any;
  description?: string;
  metadata?: any;
  beforeState?: any;
  afterState?: any;
  errorDetails?: {
    code?: string;
    message?: string;
    stack?: string;
    context?: any;
  };
  durationMs?: number;
  responseSize?: number;
  requestSize?: number;
  createdAt: string;
  occurredAt?: string;
}

export interface ActivityLogFilters {
  category?: string;
  action?: string;
  level?: 'critical' | 'error' | 'warn' | 'info' | 'debug';
  status?: 'success' | 'failed' | 'pending' | 'cancelled';
  userId?: string;
  adminId?: string;
  sessionId?: string;
  kioskId?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateActivityLogDto {
  category: string;
  action: string;
  subCategory?: string;
  level?: 'critical' | 'error' | 'warn' | 'info' | 'debug';
  status?: 'success' | 'failed' | 'pending' | 'cancelled';
  userId?: string;
  adminId?: string;
  sessionId?: string;
  kioskId?: string;
  contentPcId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceType?: string;
  location?: string;
  resourceType?: string;
  resourceId?: string;
  resourceMetadata?: any;
  description?: string;
  metadata?: any;
  beforeState?: any;
  afterState?: any;
  errorDetails?: {
    code?: string;
    message?: string;
    stack?: string;
    context?: any;
  };
  durationMs?: number;
  responseSize?: number;
  requestSize?: number;
  occurredAt?: string;
}

export interface PaginatedActivityLogs {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityLogStatistics {
  total: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
  byStatus: Record<string, number>;
  recentErrors: ActivityLog[];
}

/**
 * Activity Logging API Client
 * Provides methods to interact with the activity logging backend
 */
export class ActivityLogsApi {
  /**
   * Create a new activity log entry
   */
  static async create(log: CreateActivityLogDto): Promise<ActivityLog> {
    const response = await apiClient.post<ActivityLog>('/activity-logs', log);
    return response.data;
  }

  /**
   * Query activity logs with filters
   */
  static async query(filters: ActivityLogFilters = {}): Promise<PaginatedActivityLogs> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.action) params.append('action', filters.action);
    if (filters.level) params.append('level', filters.level);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.adminId) params.append('adminId', filters.adminId);
    if (filters.sessionId) params.append('sessionId', filters.sessionId);
    if (filters.kioskId) params.append('kioskId', filters.kioskId);
    if (filters.resourceType) params.append('resourceType', filters.resourceType);
    if (filters.resourceId) params.append('resourceId', filters.resourceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<{ data: PaginatedActivityLogs }>(
      `/activity-logs?${params.toString()}`,
    );
    
    // Handle HATEOAS wrapped response: { data: {...}, _links: {...} }
    const responseData = response.data?.data || response.data;
    
    // Ensure proper structure
    if (responseData && typeof responseData === 'object' && 'data' in responseData && 'pagination' in responseData) {
      return responseData as PaginatedActivityLogs;
    }
    
    // Fallback: return empty result
    return {
      data: [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Get activity log statistics
   */
  static async getStatistics(filters?: ActivityLogFilters): Promise<ActivityLogStatistics> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.category) params.append('category', filters.category);

    const response = await apiClient.get<{ data: ActivityLogStatistics }>(
      `/activity-logs/statistics?${params.toString()}`,
    );
    
    // Handle HATEOAS wrapped response: { data: {...}, _links: {...} }
    const responseData = response.data?.data || response.data;
    
    // Ensure proper structure
    if (responseData && typeof responseData === 'object' && 'total' in responseData) {
      return responseData as ActivityLogStatistics;
    }
    
    // Fallback: return empty statistics
    return {
      total: 0,
      byCategory: {},
      byLevel: {},
      byStatus: {},
      recentErrors: [],
    };
  }

  /**
   * List S3 archives
   */
  static async listArchives(prefix?: string): Promise<{ archives: string[]; count: number }> {
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);

    const response = await apiClient.get<{ data: { archives: string[]; count: number } }>(
      `/activity-logs/archive/s3?${params.toString()}`,
    );
    
    const responseData = response.data?.data || response.data;
    return responseData || { archives: [], count: 0 };
  }

  /**
   * Get archive metadata
   */
  static async getArchiveMetadata(key: string): Promise<any> {
    const response = await apiClient.get<{ data: any }>(
      `/activity-logs/archive/s3/${encodeURIComponent(key)}/metadata`,
    );
    
    return response.data?.data || response.data;
  }

  /**
   * Restore archive from S3
   */
  static async restoreArchive(key: string): Promise<{ restored: number; error?: string }> {
    const response = await apiClient.post<{ data: { restored: number; error?: string } }>(
      `/activity-logs/archive/s3/${encodeURIComponent(key)}/restore`,
    );
    
    return response.data?.data || response.data;
  }

  /**
   * Delete activity logs by IDs
   */
  static async deleteLogs(ids: string[]): Promise<{ deleted: number; error?: string }> {
    const response = await apiClient.delete<{ data: { deleted: number; error?: string } }>(
      '/activity-logs',
      {
        data: { ids },
      },
    );
    
    return response.data?.data || response.data;
  }

  /**
   * Archive selected logs to S3
   */
  static async archiveSelectedLogs(ids: string[], olderThanDays?: number): Promise<{
    archived: number;
    archivedSize: number;
    compressedSize: number;
    s3Key?: string;
    error?: string;
  }> {
    const response = await apiClient.post<{
      data: {
        archived: number;
        archivedSize: number;
        compressedSize: number;
        s3Key?: string;
        error?: string;
      };
    }>('/activity-logs/archive/s3/selected', {
      ids,
      olderThanDays,
    });
    
    return response.data?.data || response.data;
  }

  /**
   * Export selected logs
   */
  static async exportSelectedLogs(ids: string[], format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id));
    params.append('format', format);

    const response = await apiClient.get(`/activity-logs/export/selected?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }
}

// Export singleton instance
export const activityLogsApi = ActivityLogsApi;

/**
 * Frontend Activity Logging Client
 * Provides convenience methods for logging user actions from the frontend
 */
export class ActivityLogClient {
  /**
   * Log a user action from the frontend
   */
  static async logUserAction(
    action: string,
    metadata?: any,
    options?: {
      category?: string;
      level?: 'critical' | 'error' | 'warn' | 'info' | 'debug';
      status?: 'success' | 'failed' | 'pending' | 'cancelled';
      resourceType?: string;
      resourceId?: string;
    },
  ): Promise<void> {
    try {
      // Get session ID from localStorage or generate one
      const sessionId = localStorage.getItem('sessionId') || undefined;
      
      await ActivityLogsApi.create({
        category: options?.category || 'user',
        action,
        level: options?.level || 'info',
        status: options?.status || 'success',
        sessionId,
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to log activity', error);
    }
  }

  /**
   * Log an error from the frontend
   */
  static async logError(
    action: string,
    error: Error,
    metadata?: any,
  ): Promise<void> {
    try {
      await ActivityLogsApi.create({
        category: 'user',
        action,
        level: 'error',
        status: 'failed',
        errorDetails: {
          message: error.message,
          stack: error.stack,
        },
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
    } catch (logError) {
      console.error('Failed to log error', logError);
    }
  }
}

