'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';
import { PasswordInput } from './PasswordInput';

interface ApiSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ApiSettingsTab({ formData, onChange }: ApiSettingsTabProps) {
  return (
    <>
      <SettingsSection title="SORA2 API 설정">
        <SettingsFormGroup label="API 키">
          <PasswordInput
            value={formData.sora2ApiKey || ''}
            onChange={(value) => onChange('sora2ApiKey', value)}
            placeholder="API 키를 입력하세요"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="Base URL">
          <Input
            type="url"
            value={formData.sora2BaseUrl || 'https://api.openai.com/v1/videos'}
            onChange={(e) => onChange('sora2BaseUrl', e.target.value)}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="타임아웃 (초)">
          <Input
            type="number"
            value={formData.sora2Timeout || 300}
            onChange={(e) => onChange('sora2Timeout', parseInt(e.target.value))}
            min={60}
            max={1800}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="재시도 횟수">
          <Input
            type="number"
            value={formData.sora2RetryCount || 3}
            onChange={(e) => onChange('sora2RetryCount', parseInt(e.target.value))}
            min={1}
            max={10}
            className="w-full"
          />
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="OpenAI Whisper API 설정">
        <SettingsFormGroup label="API 키">
          <PasswordInput
            value={formData.whisperApiKey || ''}
            onChange={(value) => onChange('whisperApiKey', value)}
            placeholder="API 키를 입력하세요"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="모델">
          <select
            value={formData.whisperModel || 'whisper-1'}
            onChange={(e) => onChange('whisperModel', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="whisper-1">whisper-1</option>
          </select>
        </SettingsFormGroup>
        <SettingsFormGroup label="언어">
          <select
            value={formData.whisperLanguage || 'ko'}
            onChange={(e) => onChange('whisperLanguage', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="auto">자동 감지</option>
          </select>
        </SettingsFormGroup>
      </SettingsSection>
    </>
  );
}

