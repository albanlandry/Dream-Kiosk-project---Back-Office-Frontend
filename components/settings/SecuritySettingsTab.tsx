'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';
import { PasswordInput } from './PasswordInput';
import { Button } from '@/components/ui/button';

interface SecuritySettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onGenerateJwtSecret?: () => void;
  onGenerateEncryptionKey?: () => void;
}

export function SecuritySettingsTab({
  formData,
  onChange,
  onGenerateJwtSecret,
  onGenerateEncryptionKey,
}: SecuritySettingsTabProps) {
  const encryptionOptions = [
    {
      id: 'personalInfo',
      label: '개인정보 암호화',
      checked: formData.encryption?.personalInfo ?? true,
    },
    {
      id: 'contentInfo',
      label: '콘텐츠 정보 암호화',
      checked: formData.encryption?.contentInfo ?? true,
    },
    {
      id: 'logFiles',
      label: '로그 파일 암호화',
      checked: formData.encryption?.logFiles ?? false,
    },
  ];

  const handleEncryptionChange = (id: string, checked: boolean) => {
    const current = formData.encryption || {};
    onChange('encryption', { ...current, [id]: checked });
  };

  return (
    <>
      <SettingsSection title="인증 설정">
        <SettingsFormGroup label="JWT 시크릿 키">
          <PasswordInput
            value={formData.jwtSecret || ''}
            onChange={(value) => onChange('jwtSecret', value)}
            placeholder="JWT 시크릿 키를 입력하세요"
            showGenerateButton={!!onGenerateJwtSecret}
            onGenerate={onGenerateJwtSecret}
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="JWT 만료 시간 (시간)">
          <Input
            type="number"
            value={formData.jwtExpiry || 24}
            onChange={(e) => onChange('jwtExpiry', parseInt(e.target.value))}
            min={1}
            max={168}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="최대 로그인 시도 횟수">
          <Input
            type="number"
            value={formData.maxLoginAttempts || 5}
            onChange={(e) => onChange('maxLoginAttempts', parseInt(e.target.value))}
            min={3}
            max={10}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="계정 잠금 시간 (분)">
          <Input
            type="number"
            value={formData.lockoutDuration || 30}
            onChange={(e) => onChange('lockoutDuration', parseInt(e.target.value))}
            min={5}
            max={1440}
            className="w-full"
          />
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="암호화 설정">
        <SettingsFormGroup label="암호화 키">
          <PasswordInput
            value={formData.encryptionKey || ''}
            onChange={(value) => onChange('encryptionKey', value)}
            placeholder="암호화 키를 입력하세요"
            showGenerateButton={!!onGenerateEncryptionKey}
            onGenerate={onGenerateEncryptionKey}
          />
        </SettingsFormGroup>
        {encryptionOptions.map((option) => (
          <SettingsFormGroup key={option.id}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => handleEncryptionChange(option.id, e.target.checked)}
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

