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
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { apiClient } from '@/lib/api/client';

const TABS = [
  { id: 'general', label: '일반 설정' },
  { id: 'api', label: 'API 설정' },
  { id: 'schedule', label: '스케줄 설정' },
  { id: 'notification', label: '알림 설정' },
  { id: 'security', label: '보안 설정' },
  { id: 'backup', label: '백업 설정' },
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
  useRoutePermission('system:write', '/dashboard');

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Load settings from backend API
      // const response = await apiClient.get('/settings');
      // setFormData(response.data?.data || response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default values on error
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      // TODO: Save settings to backend API
      // await apiClient.put('/settings', formData);
      showSuccess('설정이 저장되었습니다.');
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

