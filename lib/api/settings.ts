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
};

