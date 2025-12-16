'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { settingsApi } from '@/lib/api/settings';
import { useToastStore } from '@/lib/store/toastStore';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

interface SettingsExportImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: SearchableSelectOption[] = [
  { id: '', label: '전체', value: '' },
  { id: 'general', label: '일반 설정', value: 'general' },
  { id: 'api', label: 'API 설정', value: 'api' },
  { id: 'schedule', label: '스케줄 설정', value: 'schedule' },
  { id: 'notification', label: '알림 설정', value: 'notification' },
  { id: 'security', label: '보안 설정', value: 'security' },
  { id: 'backup', label: '백업 설정', value: 'backup' },
];

export function SettingsExportImportModal({
  open,
  onClose,
  onSuccess,
}: SettingsExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeEncrypted, setIncludeEncrypted] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToastStore();

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const result = await settingsApi.exportSettings({
        includeEncrypted,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        format: 'json',
      });

      // Download as file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('설정이 내보내졌습니다.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      showError(error.response?.data?.message || '내보내기에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Preview import (dry run)
      const preview = await settingsApi.importSettings(data, {
        validate: true,
        dryRun: true,
      });

      setImportPreview(preview);
    } catch (error: any) {
      showError('파일을 읽는데 실패했습니다. 유효한 JSON 파일인지 확인하세요.');
      setImportFile(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsProcessing(true);
      const text = await importFile.text();
      const data = JSON.parse(text);

      const result = await settingsApi.importSettings(data, {
        validate: true,
        dryRun: false,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      });

      if (result.success) {
        showSuccess(`${result.imported}개 설정이 가져와졌습니다.`);
        onSuccess?.();
        onClose();
        setImportFile(null);
        setImportPreview(null);
      } else {
        showError(
          `가져오기 실패: ${result.errors.length}개 오류 발생. ${result.errors.map((e) => e.error).join(', ')}`,
        );
      }
    } catch (error: any) {
      showError(error.response?.data?.message || '가져오기에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>설정 내보내기/가져오기</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'export'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('export')}
          >
            내보내기
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'import'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('import')}
          >
            가져오기
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 선택 (선택사항)
              </label>
              <SearchableSelect
                options={CATEGORIES}
                value={selectedCategories[0] || ''}
                onChange={(value) => {
                  if (value) {
                    setSelectedCategories([value]);
                  } else {
                    setSelectedCategories([]);
                  }
                }}
                placeholder="전체 카테고리"
              />
              <p className="text-xs text-gray-500 mt-1">
                선택하지 않으면 모든 카테고리가 내보내집니다.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeEncrypted}
                  onChange={(e) => setIncludeEncrypted(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">암호화된 필드 포함</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                암호화된 필드(API 키 등)를 포함하여 내보냅니다. 보안에 주의하세요.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                취소
              </Button>
              <Button
                onClick={handleExport}
                disabled={isProcessing}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isProcessing ? '내보내는 중...' : '내보내기'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설정 파일 선택
              </label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON 형식의 설정 파일을 선택하세요.
              </p>
            </div>

            {importPreview && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">가져오기 미리보기</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>가져올 설정: {importPreview.imported}개</p>
                  <p>건너뛸 설정: {importPreview.skipped}개</p>
                  {importPreview.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-medium">오류:</p>
                      <ul className="list-disc list-inside text-red-600">
                        {importPreview.errors.map((error: any, idx: number) => (
                          <li key={idx}>
                            {error.key}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
                취소
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || isProcessing}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isProcessing ? '가져오는 중...' : '가져오기'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

