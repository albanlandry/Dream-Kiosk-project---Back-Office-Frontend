'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';
import { PasswordInput } from './PasswordInput';

interface NotificationSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function NotificationSettingsTab({ formData, onChange }: NotificationSettingsTabProps) {
  const notificationOptions = [
    {
      id: 'contentRegistration',
      label: '콘텐츠 등록 완료 알림',
      checked: formData.notifications?.contentRegistration ?? true,
    },
    {
      id: 'contentGeneration',
      label: '콘텐츠 생성 완료 알림',
      checked: formData.notifications?.contentGeneration ?? true,
    },
    {
      id: 'kioskError',
      label: '키오스크 오류 알림',
      checked: formData.notifications?.kioskError ?? true,
    },
    {
      id: 'dailyReport',
      label: '일일 리포트 알림',
      checked: formData.notifications?.dailyReport ?? false,
    },
  ];

  const handleNotificationChange = (id: string, checked: boolean) => {
    const current = formData.notifications || {};
    onChange('notifications', { ...current, [id]: checked });
  };

  return (
    <>
      <SettingsSection title="이메일 알림">
        <SettingsFormGroup label="SMTP 호스트">
          <Input
            type="text"
            value={formData.smtpHost || ''}
            onChange={(e) => onChange('smtpHost', e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="SMTP 포트">
          <Input
            type="number"
            value={formData.smtpPort || 587}
            onChange={(e) => onChange('smtpPort', parseInt(e.target.value))}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="SMTP 사용자명">
          <Input
            type="email"
            value={formData.smtpUser || ''}
            onChange={(e) => onChange('smtpUser', e.target.value)}
            placeholder="admin@example.com"
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="SMTP 비밀번호">
          <PasswordInput
            value={formData.smtpPassword || ''}
            onChange={(value) => onChange('smtpPassword', value)}
            placeholder="비밀번호를 입력하세요"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="알림 수신 이메일">
          <Input
            type="email"
            value={formData.notificationEmail || ''}
            onChange={(e) => onChange('notificationEmail', e.target.value)}
            placeholder="notifications@example.com"
            className="w-full"
          />
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="알림 설정">
        {notificationOptions.map((option) => (
          <SettingsFormGroup key={option.id}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => handleNotificationChange(option.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          </SettingsFormGroup>
        ))}
      </SettingsSection>
    </>
  );
}

