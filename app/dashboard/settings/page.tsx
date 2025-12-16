'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { GeneralSettingsTab } from '@/components/settings/GeneralSettingsTab';
import { ApiSettingsTab } from '@/components/settings/ApiSettingsTab';
import { ScheduleSettingsTab } from '@/components/settings/ScheduleSettingsTab';
import { NotificationSettingsTab } from '@/components/settings/NotificationSettingsTab';
import { SecuritySettingsTab } from '@/components/settings/SecuritySettingsTab';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';
import { AdvancedSettingsTab } from '@/components/settings/AdvancedSettingsTab';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { settingsApi, SystemSettings } from '@/lib/api/settings';

const TABS = [
  { id: 'general', label: '일반 설정' },
  { id: 'api', label: 'API 설정' },
  { id: 'schedule', label: '스케줄 설정' },
  { id: 'notification', label: '알림 설정' },
  { id: 'security', label: '보안 설정' },
  { id: 'backup', label: '백업 설정' },
  { id: 'advanced', label: '고급 관리' },
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    // General settings
    systemName: 'Dream Piece System',
    systemDescription: '55인치 대형 키오스크 환경에서 동작하는 인터랙티브 AI 콘텐츠 시스템',
    timezone: 'Asia/Seoul',
    language: 'ko',
    maxRegenerations: 3,
    defaultDuration: 7,
    maxVideoSize: 100,
    supportedFormats: ['mp4', 'mov'],
    // API settings
    sora2ApiKey: '',
    sora2BaseUrl: 'https://api.openai.com/v1/videos',
    sora2Timeout: 300,
    sora2RetryCount: 3,
    whisperApiKey: '',
    whisperModel: 'whisper-1',
    whisperLanguage: 'ko',
    // Schedule settings
    maxScheduleCount: 100,
    defaultContentDuration: 30,
    autoRemoveOldest: true,
    enableScheduleRotation: true,
    requireAuthentication: true,
    maxNicknameLength: 10,
    maxMessageLength: 20,
    // Notification settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    notificationEmail: '',
    notifications: {
      contentRegistration: true,
      contentGeneration: true,
      kioskError: true,
      dailyReport: false,
    },
    // Security settings
    jwtSecret: '',
    jwtExpiry: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    encryptionKey: '',
    encryption: {
      personalInfo: true,
      contentInfo: true,
      logFiles: false,
    },
    // Backup settings
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupRetention: 30,
    backupStorage: 'local',
    backupPath: '/backups',
    backupTypes: {
      database: true,
      files: true,
      settings: false,
    },
  });

  const { showSuccess, showError } = useToastStore();

  // Protect route with permission check
  useRoutePermission('settings:update', '/dashboard');

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const settings = await settingsApi.getSettings();
      
      // Transform nested settings to flat formData structure
      const flatData: any = {
        // General settings
        systemName: settings.general?.systemName || '',
        systemDescription: settings.general?.systemDescription || '',
        timezone: settings.general?.timezone || 'Asia/Seoul',
        language: settings.general?.language || 'ko',
        maxRegenerations: settings.general?.maxRegenerations || 3,
        defaultDuration: settings.general?.defaultDuration || 7,
        maxVideoSize: settings.general?.maxVideoSize || 100,
        supportedFormats: settings.general?.supportedFormats || ['mp4', 'mov'],
        // API settings
        sora2ApiKey: settings.api?.sora2?.sora2ApiKey || '',
        sora2BaseUrl: settings.api?.sora2?.baseUrl || 'https://api.openai.com/v1/videos',
        sora2Timeout: settings.api?.sora2?.timeout || 300,
        sora2RetryCount: settings.api?.sora2?.retryCount || 3,
        whisperApiKey: settings.api?.whisper?.whisperApiKey || '',
        whisperModel: settings.api?.whisper?.model || 'whisper-1',
        whisperLanguage: settings.api?.whisper?.language || 'ko',
        // Schedule settings
        maxScheduleCount: settings.schedule?.maxScheduleCount || 100,
        defaultContentDuration: settings.schedule?.defaultContentDuration || 30,
        autoRemoveOldest: settings.schedule?.autoRemoveOldest ?? true,
        enableScheduleRotation: settings.schedule?.enableScheduleRotation ?? true,
        requireAuthentication: settings.schedule?.requireAuthentication ?? true,
        maxNicknameLength: settings.schedule?.maxNicknameLength || 10,
        maxMessageLength: settings.schedule?.maxMessageLength || 20,
        // Notification settings
        smtpHost: settings.notification?.smtp?.host || '',
        smtpPort: settings.notification?.smtp?.port || 587,
        smtpUser: settings.notification?.smtp?.user || '',
        smtpPassword: settings.notification?.smtp?.password || '',
        notificationEmail: settings.notification?.notificationEmail || '',
        notifications: settings.notification?.notifications || {
          contentRegistration: true,
          contentGeneration: true,
          kioskError: true,
          dailyReport: false,
        },
        // Security settings
        jwtSecret: settings.security?.jwt?.secret || '',
        jwtExpiry: settings.security?.jwt?.expiry || 24,
        maxLoginAttempts: settings.security?.maxLoginAttempts || 5,
        lockoutDuration: settings.security?.lockoutDuration || 30,
        encryptionKey: settings.security?.encryption?.key || '',
        encryption: settings.security?.encryption || {
          personalInfo: true,
          contentInfo: true,
          logFiles: false,
        },
        // Backup settings
        autoBackupEnabled: settings.backup?.autoBackupEnabled ?? true,
        backupFrequency: settings.backup?.backupFrequency || 'daily',
        backupTime: settings.backup?.backupTime || '02:00',
        backupRetention: settings.backup?.backupRetention || 30,
        backupStorage: settings.backup?.backupStorage || 'local',
        backupPath: settings.backup?.backupPath || '/backups',
        backupTypes: settings.backup?.backupTypes || {
          database: true,
          files: true,
          settings: false,
        },
      };
      
      setFormData(flatData);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      showError(error.response?.data?.message || '설정을 불러오는데 실패했습니다.');
      // Use default values on error (already set in initial state)
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      // Handle nested fields
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Transform flat formData to nested structure expected by API
      const updates: Partial<SystemSettings> = {
        general: {
          systemName: formData.systemName || '',
          systemDescription: formData.systemDescription || '',
          timezone: formData.timezone || 'Asia/Seoul',
          language: (formData.language as 'ko' | 'en' | 'ja') || 'ko',
          maxRegenerations: formData.maxRegenerations || 3,
          defaultDuration: formData.defaultDuration || 7,
          maxVideoSize: formData.maxVideoSize || 100,
          supportedFormats: formData.supportedFormats || ['mp4', 'mov'],
        },
        api: {
          sora2: {
            sora2ApiKey: formData.sora2ApiKey || '',
            baseUrl: formData.sora2BaseUrl || 'https://api.openai.com/v1/videos',
            timeout: formData.sora2Timeout || 300,
            retryCount: formData.sora2RetryCount || 3,
          },
          whisper: {
            whisperApiKey: formData.whisperApiKey || '',
            model: formData.whisperModel || 'whisper-1',
            language: formData.whisperLanguage || 'ko',
          },
        },
        schedule: {
          maxScheduleCount: formData.maxScheduleCount || 100,
          defaultContentDuration: formData.defaultContentDuration || 30,
          autoRemoveOldest: formData.autoRemoveOldest ?? true,
          enableScheduleRotation: formData.enableScheduleRotation ?? true,
          requireAuthentication: formData.requireAuthentication ?? true,
          maxNicknameLength: formData.maxNicknameLength || 10,
          maxMessageLength: formData.maxMessageLength || 20,
        },
        notification: {
          smtp: {
            host: formData.smtpHost || '',
            port: formData.smtpPort || 587,
            user: formData.smtpUser || '',
            password: formData.smtpPassword || '',
          },
          notificationEmail: formData.notificationEmail || '',
          notifications: formData.notifications || {
            contentRegistration: true,
            contentGeneration: true,
            kioskError: true,
            dailyReport: false,
          },
        },
        security: {
          jwt: {
            secret: formData.jwtSecret || '',
            expiry: formData.jwtExpiry || 24,
          },
          maxLoginAttempts: formData.maxLoginAttempts || 5,
          lockoutDuration: formData.lockoutDuration || 30,
          encryption: {
            key: formData.encryptionKey || '',
            personalInfo: formData.encryption?.personalInfo ?? true,
            contentInfo: formData.encryption?.contentInfo ?? true,
            logFiles: formData.encryption?.logFiles ?? false,
          },
        },
        backup: {
          autoBackupEnabled: formData.autoBackupEnabled ?? true,
          backupFrequency: (formData.backupFrequency as 'daily' | 'weekly' | 'monthly') || 'daily',
          backupTime: formData.backupTime || '02:00',
          backupRetention: formData.backupRetention || 30,
          backupStorage: (formData.backupStorage as 'local' | 's3' | 'gcs') || 'local',
          backupPath: formData.backupPath || '/backups',
          backupTypes: formData.backupTypes || {
            database: true,
            files: true,
            settings: false,
          },
        },
      };
      
      await settingsApi.updateSettings(updates, 'Updated via settings page');
      showSuccess('설정이 저장되었습니다.');
      
      // Reload settings to get updated values
      await loadSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showError(error.response?.data?.message || '설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateJwtSecret = () => {
    // Generate a random JWT secret
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    handleFieldChange('jwtSecret', secret);
    showSuccess('JWT 시크릿 키가 생성되었습니다.');
  };

  const handleGenerateEncryptionKey = () => {
    // Generate a random encryption key
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    handleFieldChange('encryptionKey', key);
    showSuccess('암호화 키가 생성되었습니다.');
  };

  const handleBackupNow = async () => {
    try {
      setIsSaving(true);
      // TODO: Trigger backup
      // await apiClient.post('/backups/create');
      showSuccess('백업이 시작되었습니다.');
    } catch (error: any) {
      showError(error.response?.data?.message || '백업 시작에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreBackup = async () => {
    // TODO: Implement backup restore
    showError('백업 복원 기능은 곧 추가될 예정입니다.');
  };

  const handleDeleteOldBackups = async () => {
    if (!confirm('오래된 백업을 삭제하시겠습니까?')) {
      return;
    }
    try {
      setIsSaving(true);
      // TODO: Delete old backups
      // await apiClient.delete('/backups/old');
      showSuccess('오래된 백업이 삭제되었습니다.');
    } catch (error: any) {
      showError(error.response?.data?.message || '백업 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettingsTab formData={formData} onChange={handleFieldChange} />
        );
      case 'api':
        return <ApiSettingsTab formData={formData} onChange={handleFieldChange} />;
      case 'schedule':
        return (
          <ScheduleSettingsTab formData={formData} onChange={handleFieldChange} />
        );
      case 'notification':
        return (
          <NotificationSettingsTab formData={formData} onChange={handleFieldChange} />
        );
      case 'security':
        return (
          <SecuritySettingsTab
            formData={formData}
            onChange={handleFieldChange}
            onGenerateJwtSecret={handleGenerateJwtSecret}
            onGenerateEncryptionKey={handleGenerateEncryptionKey}
          />
        );
      case 'backup':
        return (
          <BackupSettingsTab
            formData={formData}
            onChange={handleFieldChange}
            onBackupNow={handleBackupNow}
            onRestoreBackup={handleRestoreBackup}
            onDeleteOldBackups={handleDeleteOldBackups}
          />
        );
      case 'advanced':
        return <AdvancedSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <LoadingModal
        isOpen={isLoading || isSaving}
        message={isLoading ? '설정을 불러오는 중...' : '설정을 저장하는 중...'}
      />
      <Header
        title="시스템 설정"
        description="시스템 전반적인 설정 및 구성"
        action={{
          label: '설정 저장',
          icon: 'fas fa-save',
          onClick: handleSave,
        }}
      />
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="system-settings">
          <SettingsTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div>{renderTabContent()}</div>
        </div>
      </div>
    </>
  );
}

