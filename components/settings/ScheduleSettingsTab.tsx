'use client';

import { SettingsSection } from './SettingsSection';
import { SettingsFormGroup } from './SettingsFormGroup';
import { Input } from '@/components/ui/input';

interface ScheduleSettingsTabProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ScheduleSettingsTab({ formData, onChange }: ScheduleSettingsTabProps) {
  return (
    <>
      <SettingsSection title="스케줄 정책 설정">
        <SettingsFormGroup
          label="최대 스케줄 개수"
          helpText="스케줄 개수가 이 값을 초과하면 가장 오래된 항목이 자동으로 제거됩니다 (FIFO 정책)"
        >
          <Input
            type="number"
            value={formData.maxScheduleCount || 100}
            onChange={(e) => onChange('maxScheduleCount', parseInt(e.target.value))}
            min={1}
            max={1000}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup
          label="기본 콘텐츠 재생 시간 (초)"
          helpText="결제 없이 등록된 콘텐츠의 기본 재생 시간입니다"
        >
          <Input
            type="number"
            value={formData.defaultContentDuration || 30}
            onChange={(e) => onChange('defaultContentDuration', parseInt(e.target.value))}
            min={10}
            max={300}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoRemoveOldest ?? true}
              onChange={(e) => onChange('autoRemoveOldest', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">자동으로 오래된 항목 제거</span>
          </label>
        </SettingsFormGroup>
        <SettingsFormGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enableScheduleRotation ?? true}
              onChange={(e) => onChange('enableScheduleRotation', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">스케줄 순환 재생 활성화</span>
          </label>
        </SettingsFormGroup>
      </SettingsSection>

      <SettingsSection title="콘텐츠 등록 정책">
        <SettingsFormGroup
          helpText="용인 아르피아 프로젝트는 결제 및 인증 없이 콘텐츠 등록이 가능합니다"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireAuthentication ?? true}
              disabled
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">인증 절차 없이 등록 (용인 아르피아 정책)</span>
          </label>
        </SettingsFormGroup>
        <SettingsFormGroup label="최대 작성자명 길이">
          <Input
            type="number"
            value={formData.maxNicknameLength || 10}
            onChange={(e) => onChange('maxNicknameLength', parseInt(e.target.value))}
            min={1}
            max={20}
            className="w-full"
          />
        </SettingsFormGroup>
        <SettingsFormGroup label="최대 메시지 길이">
          <Input
            type="number"
            value={formData.maxMessageLength || 20}
            onChange={(e) => onChange('maxMessageLength', parseInt(e.target.value))}
            min={1}
            max={100}
            className="w-full"
          />
        </SettingsFormGroup>
      </SettingsSection>
    </>
  );
}

