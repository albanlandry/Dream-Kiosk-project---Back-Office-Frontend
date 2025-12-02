'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BackupSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onBackupNow?: () => void;
  onRestoreBackup?: () => void;
  onDeleteOldBackups?: () => void;
}

export function BackupSettingsTab({
  formData,
  onChange,
  onBackupNow,
  onRestoreBackup,
  onDeleteOldBackups,
}: BackupSettingsTabProps) {
  const backupOptions = [
    {
      id: 'database',
      label: '데이터베이스 백업',
      checked: formData.backupTypes?.database ?? true,
    },
    {
      id: 'files',
      label: '파일 백업',
      checked: formData.backupTypes?.files ?? true,
    },
    {
      id: 'settings',
      label: '설정 백업',
      checked: formData.backupTypes?.settings ?? false,
    },
  ];

  const handleBackupTypeChange = (id: string, checked: boolean) => {
    const current = formData.backupTypes || {};
    onChange('backupTypes', { ...current, [id]: checked });
  };

  return (
    <>
      <SettingsSection title="자동 백업">
        <SettingsFormGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoBackupEnabled ?? true}
              onChange={(e) => onChange('autoBackupEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">자동 백업 활성화</span>
          </label>
        </SettingsFormGroup>
        <SettingsFormGroup label="백업 주기">
          <select
            value={formData.backupFrequency || 'daily'}
            onChange={(e) => onChange('backupFrequency', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="daily">매일</option>
            <option value="weekly">매주</option>
            <option value="monthly">매월</option>
          </select>
        </SettingsFormGroup>
        <SettingsFormGroup label="백업 시간">
          <Input
            type="time"
            value={formData.backupTime || '02:00'}
            onChange={(e) => onChange('backupTime', e.target.value)}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="백업 보관 기간 (일)">
          <Input
            type="number"
            value={formData.backupRetention || 30}
            onChange={(e) => onChange('backupRetention', parseInt(e.target.value))}
            min={7}
            max={365}
            className="w-full"
          />
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="백업 저장소">
        <SettingsFormGroup label="저장소 유형">
          <select
            value={formData.backupStorage || 'local'}
            onChange={(e) => onChange('backupStorage', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="local">로컬 저장소</option>
            <option value="s3">AWS S3</option>
            <option value="gcs">Google Cloud Storage</option>
          </select>
        </SettingsFormGroup>
        <SettingsFormGroup label="백업 경로">
          <Input
            type="text"
            value={formData.backupPath || '/backups'}
            onChange={(e) => onChange('backupPath', e.target.value)}
            className="w-full"
          />
        </SettingsFormGroup>
        {backupOptions.map((option) => (
          <SettingsFormGroup key={option.id}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => handleBackupTypeChange(option.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          </SettingsFormGroup>
        ))}
      </SettingsSection>

      <SettingsSection title="백업 관리">
        <div className="flex gap-3 flex-wrap">
          {onBackupNow && (
            <Button
              onClick={onBackupNow}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <i className="fas fa-download mr-2"></i>
              지금 백업
            </Button>
          )}
          {onRestoreBackup && (
            <Button
              onClick={onRestoreBackup}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <i className="fas fa-upload mr-2"></i>
              백업 복원
            </Button>
          )}
          {onDeleteOldBackups && (
            <Button
              onClick={onDeleteOldBackups}
              variant="outline"
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            >
              <i className="fas fa-trash mr-2"></i>
              오래된 백업 삭제
            </Button>
          )}
        </div>
      </SettingsSection>
    </>
  );
}

