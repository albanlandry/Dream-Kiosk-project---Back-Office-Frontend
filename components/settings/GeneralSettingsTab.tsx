'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';
import { CheckboxGroup } from './CheckboxGroup';

interface GeneralSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function GeneralSettingsTab({ formData, onChange }: GeneralSettingsTabProps) {
  const formatOptions = [
    { id: 'mp4', label: 'MP4', checked: formData.supportedFormats?.includes('mp4') || false },
    { id: 'mov', label: 'MOV', checked: formData.supportedFormats?.includes('mov') || false },
    { id: 'avi', label: 'AVI', checked: formData.supportedFormats?.includes('avi') || false },
    { id: 'webm', label: 'WebM', checked: formData.supportedFormats?.includes('webm') || false },
  ];

  const handleFormatChange = (id: string, checked: boolean) => {
    const current = formData.supportedFormats || [];
    if (checked) {
      onChange('supportedFormats', [...current, id]);
    } else {
      onChange('supportedFormats', current.filter((f: string) => f !== id));
    }
  };

  return (
    <>
      <SettingsSection title="기본 정보">
        <SettingsFormGroup label="시스템 이름">
          <Input
            type="text"
            value={formData.systemName || ''}
            onChange={(e) => onChange('systemName', e.target.value)}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="시스템 설명">
          <textarea
            value={formData.systemDescription || ''}
            onChange={(e) => onChange('systemDescription', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="시간대">
          <select
            value={formData.timezone || 'Asia/Seoul'}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Asia/Seoul">Asia/Seoul (KST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
          </select>
        </SettingsFormGroup>
        <SettingsFormGroup label="기본 언어">
          <select
            value={formData.language || 'ko'}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="콘텐츠 설정">
        <SettingsFormGroup label="최대 재생성 횟수">
          <Input
            type="number"
            value={formData.maxRegenerations || 3}
            onChange={(e) => onChange('maxRegenerations', parseInt(e.target.value))}
            min={1}
            max={10}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="기본 노출 기간 (일)">
          <Input
            type="number"
            value={formData.defaultDuration || 7}
            onChange={(e) => onChange('defaultDuration', parseInt(e.target.value))}
            min={1}
            max={365}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="최대 영상 크기 (MB)">
          <Input
            type="number"
            value={formData.maxVideoSize || 100}
            onChange={(e) => onChange('maxVideoSize', parseInt(e.target.value))}
            min={10}
            max={1000}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="지원 형식">
          <CheckboxGroup options={formatOptions} onChange={handleFormatChange} />
        </SettingsFormGroup>
      </SettingsSection>
    </>
  );
}

