import apiClient from './client';

export interface SystemSettings {
  general: {
    systemName: string;
    systemDescription: string;
    timezone: string;
    language: 'ko' | 'en' | 'ja';
    maxRegenerations: number;
    defaultDuration: number;
    maxVideoSize: number;
    supportedFormats: string[];
  };
  api: {
    sora2: {
      sora2ApiKey: string;
      baseUrl: string;
      timeout: number;
      retryCount: number;
    };
    whisper: {
      whisperApiKey: string;
      model: string;
      language: string;
    };
  };
  schedule: {
    maxScheduleCount: number;
    defaultContentDuration: number;
    autoRemoveOldest: boolean;
    enableScheduleRotation: boolean;
    requireAuthentication: boolean;
    maxNicknameLength: number;
    maxMessageLength: number;
  };
  notification: {
    smtp: {
      host: string;
      port: number;
      user: string;
      password: string;
    };
    notificationEmail: string;
    notifications: {
      contentRegistration: boolean;
      contentGeneration: boolean;
      kioskError: boolean;
      dailyReport: boolean;
    };
  };
  security: {
    jwt: {
      secret: string;
      expiry: number;
    };
    maxLoginAttempts: number;
    lockoutDuration: number;
    encryption: {
      key: string;
      personalInfo: boolean;
      contentInfo: boolean;
      logFiles: boolean;
    };
  };
  backup: {
    autoBackupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupTime: string;
    backupRetention: number;
    backupStorage: 'local' | 's3' | 'gcs';
    backupPath: string;
    backupTypes: {
      database: boolean;
      files: boolean;
      settings: boolean;
    };
  };
}

export interface SettingsHistory {
  id: string;
  settingId: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changeType: 'create' | 'update' | 'delete';
  changeReason?: string;
  createdAt: Date;
}

export interface SettingsHistoryResponse {
  history: SettingsHistory[];
  total: number;
}

export const settingsApi = {
  /**
   * Get all system settings
   */
  async getSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<{ data: SystemSettings }>('/settings');
    return response.data.data;
  },

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<Partial<SystemSettings>> {
    const response = await apiClient.get<{ data: Partial<SystemSettings> }>(
      `/settings/category/${category}`,
    );
    return response.data.data;
  },

  /**
   * Update system settings
   */
  async updateSettings(
    updates: Partial<SystemSettings>,
    reason?: string,
  ): Promise<SystemSettings> {
    const params = reason ? { reason } : {};
    const response = await apiClient.put<{ data: SystemSettings }>(
      '/settings',
      updates,
      { params },
    );
    return response.data.data;
  },

  /**
   * Get settings change history
   */
  async getSettingsHistory(options?: {
    settingId?: string;
    category?: string;
    changedBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<SettingsHistoryResponse> {
    const response = await apiClient.get<{ data: SettingsHistoryResponse }>(
      '/settings/history',
      { params: options },
    );
    return response.data.data;
  },

  /**
   * Export settings
   */
  async exportSettings(options?: {
    includeEncrypted?: boolean;
    categories?: string[];
    format?: 'json' | 'json-compressed';
  }): Promise<{ data: any; metadata: any }> {
    const response = await apiClient.post<{ data: { data: any; metadata: any } }>(
      '/settings/export',
      {},
      { params: options },
    );
    return response.data.data;
  },

  /**
   * Import settings
   */
  async importSettings(
    importData: any,
    options?: {
      validate?: boolean;
      dryRun?: boolean;
      categories?: string[];
    },
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ key: string; error: string }>;
    preview?: any;
  }> {
    const response = await apiClient.post<{
      data: {
        success: boolean;
        imported: number;
        skipped: number;
        errors: Array<{ key: string; error: string }>;
        preview?: any;
      };
    }>('/settings/import', importData, { params: options });
    return response.data.data;
  },

  /**
   * Create backup
   */
  async createBackup(backupName: string, backupType?: 'manual' | 'scheduled' | 'auto'): Promise<any> {
    const response = await apiClient.post<{ data: any }>('/settings/backup', {
      backupName,
      backupType: backupType || 'manual',
    });
    return response.data.data;
  },

  /**
   * Get all backups
   */
  async getBackups(limit?: number): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/settings/backups', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get backup by ID
   */
  async getBackup(id: string): Promise<any> {
    const response = await apiClient.get<{ data: any }>(`/settings/backups/${id}`);
    return response.data.data;
  },

  /**
   * Restore backup
   */
  async restoreBackup(id: string, reason?: string): Promise<SystemSettings> {
    const response = await apiClient.post<{ data: SystemSettings }>(
      `/settings/backups/${id}/restore`,
      { reason },
    );
    return response.data.data;
  },

  /**
   * Create version
   */
  async createVersion(description?: string): Promise<any> {
    const response = await apiClient.post<{ data: any }>('/settings/versions', { description });
    return response.data.data;
  },

  /**
   * Get all versions
   */
  async getVersions(limit?: number): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/settings/versions', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get version by ID
   */
  async getVersion(id: string): Promise<any> {
    const response = await apiClient.get<{ data: any }>(`/settings/versions/${id}`);
    return response.data.data;
  },

  /**
   * Compare versions
   */
  async compareVersions(id1: string, id2: string): Promise<{
    differences: Array<{
      category: string;
      key: string;
      oldValue: any;
      newValue: any;
    }>;
  }> {
    const response = await apiClient.get<{
      data: {
        differences: Array<{
          category: string;
          key: string;
          oldValue: any;
          newValue: any;
        }>;
      };
    }>(`/settings/versions/${id1}/compare/${id2}`);
    return response.data.data;
  },

  /**
   * Rollback to version
   */
  async rollbackToVersion(id: string, reason?: string): Promise<SystemSettings> {
    const response = await apiClient.post<{ data: SystemSettings }>(
      `/settings/versions/${id}/rollback`,
      { reason },
    );
    return response.data.data;
  },

  /**
   * Update validation rules
   */
  async updateValidationRules(
    category: string,
    key: string,
    validation: any,
  ): Promise<any> {
    const response = await apiClient.put<{ data: any }>(
      `/settings/validation/${category}/${key}`,
      { validation },
    );
    return response.data.data;
  },

  /**
   * Get validation rules
   */
  async getValidationRules(category: string, key: string): Promise<{ validation: any }> {
    const response = await apiClient.get<{ data: { validation: any } }>(
      `/settings/validation/${category}/${key}`,
    );
    return response.data.data;
  },
};

