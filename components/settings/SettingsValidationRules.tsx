'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { settingsApi } from '@/lib/api/settings';
import { useToastStore } from '@/lib/store/toastStore';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

const CATEGORIES: SearchableSelectOption[] = [
  { id: 'general', label: '일반 설정', value: 'general' },
  { id: 'api', label: 'API 설정', value: 'api' },
  { id: 'schedule', label: '스케줄 설정', value: 'schedule' },
  { id: 'notification', label: '알림 설정', value: 'notification' },
  { id: 'security', label: '보안 설정', value: 'security' },
  { id: 'backup', label: '백업 설정', value: 'backup' },
];

interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  required?: boolean;
}

export function SettingsValidationRules() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [settings, setSettings] = useState<any[]>([]);
  const [validation, setValidation] = useState<ValidationRule>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    if (selectedCategory) {
      loadSettings();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory && selectedKey) {
      loadValidationRules();
    }
  }, [selectedCategory, selectedKey]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const categorySettings = await settingsApi.getSettingsByCategory(selectedCategory);
      // Flatten nested structure to get all keys
      const keys: any[] = [];
      const flatten = (obj: any, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, fullKey);
          } else {
            keys.push({ key: fullKey, value });
          }
        }
      };
      flatten(categorySettings);
      setSettings(keys);
    } catch (error: any) {
      showError('설정을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadValidationRules = async () => {
    try {
      const result = await settingsApi.getValidationRules(selectedCategory, selectedKey);
      setValidation(result.validation || {});
    } catch (error: any) {
      // If validation rules don't exist, start with empty
      setValidation({});
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsApi.updateValidationRules(selectedCategory, selectedKey, validation);
      showSuccess('검증 규칙이 저장되었습니다.');
      setShowEditModal(false);
    } catch (error: any) {
      showError(error.response?.data?.message || '검증 규칙 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const keyOptions: SearchableSelectOption[] = [
    { id: '', label: '설정 선택', value: '' },
    ...settings.map((s) => ({
      id: s.key,
      label: s.key,
      value: s.key,
    })),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">검증 규칙 커스터마이징</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <SearchableSelect
            options={CATEGORIES}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="카테고리 선택"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">설정 키</label>
          <SearchableSelect
            options={keyOptions}
            value={selectedKey}
            onChange={setSelectedKey}
            placeholder="설정 키 선택"
            disabled={!selectedCategory}
          />
        </div>
      </div>

      {selectedCategory && selectedKey && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-800">
                {selectedCategory}.{selectedKey}
              </h4>
              <p className="text-sm text-gray-600">
                현재 검증 규칙: {Object.keys(validation).length > 0 ? '설정됨' : '없음'}
              </p>
            </div>
            <Button
              onClick={() => setShowEditModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <i className="fas fa-edit mr-2"></i>
              규칙 편집
            </Button>
          </div>
        </div>
      )}

      {/* Edit Validation Rules Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="min-w-xl w-full">
          <DialogHeader>
            <DialogTitle>
              검증 규칙 편집 - {selectedCategory}.{selectedKey}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={validation.required || false}
                  onChange={(e) =>
                    setValidation({ ...validation, required: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">필수 항목</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소값 (숫자)
                </label>
                <Input
                  type="number"
                  value={validation.min ?? ''}
                  onChange={(e) =>
                    setValidation({
                      ...validation,
                      min: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="최소값"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대값 (숫자)
                </label>
                <Input
                  type="number"
                  value={validation.max ?? ''}
                  onChange={(e) =>
                    setValidation({
                      ...validation,
                      max: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="최대값"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                패턴 (정규식, 문자열)
              </label>
              <Input
                value={validation.pattern || ''}
                onChange={(e) =>
                  setValidation({ ...validation, pattern: e.target.value || undefined })
                }
                placeholder="예: ^[a-zA-Z0-9]+$"
              />
              <p className="text-xs text-gray-500 mt-1">
                정규식 패턴을 입력하세요. 문자열 값이 이 패턴과 일치해야 합니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                허용 값 목록 (쉼표로 구분)
              </label>
              <Input
                value={validation.enum ? validation.enum.join(', ') : ''}
                onChange={(e) =>
                  setValidation({
                    ...validation,
                    enum: e.target.value
                      ? e.target.value.split(',').map((v) => v.trim())
                      : undefined,
                  })
                }
                placeholder="예: option1, option2, option3"
              />
              <p className="text-xs text-gray-500 mt-1">
                값이 이 목록 중 하나여야 합니다.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setValidation({});
                  setShowEditModal(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                초기화
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

