'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { settingsApi } from '@/lib/api/settings';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

interface Version {
  id: string;
  version: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  creator?: {
    id: string;
    username: string;
  };
}

export function SettingsVersioning() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [compareVersion1, setCompareVersion1] = useState<Version | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<Version | null>(null);
  const [differences, setDifferences] = useState<any[]>([]);
  const [versionDescription, setVersionDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getVersions(50);
      setVersions(data);
    } catch (error: any) {
      showError('버전 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      setIsProcessing(true);
      await settingsApi.createVersion(versionDescription || undefined);
      showSuccess('버전이 생성되었습니다.');
      setShowCreateModal(false);
      setVersionDescription('');
      loadVersions();
    } catch (error: any) {
      showError(error.response?.data?.message || '버전 생성에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompare = async (v1: Version, v2: Version) => {
    try {
      setIsProcessing(true);
      const result = await settingsApi.compareVersions(v1.id, v2.id);
      setDifferences(result.differences);
      setShowCompareModal(true);
    } catch (error: any) {
      showError(error.response?.data?.message || '비교에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRollback = async (version: Version) => {
    if (!confirm(`"${version.version}" 버전으로 롤백하시겠습니까?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await settingsApi.rollbackToVersion(version.id);
      showSuccess('설정이 롤백되었습니다.');
      setShowRollbackModal(false);
      setSelectedVersion(null);
      loadVersions();
    } catch (error: any) {
      showError(error.response?.data?.message || '롤백에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">버전 관리</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <i className="fas fa-plus mr-2"></i>
          버전 생성
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">버전 목록을 불러오는 중...</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">버전이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="border rounded-lg p-4 hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{version.version}</h4>
                    {version.isActive && (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        현재 활성
                      </span>
                    )}
                  </div>
                  {version.description && (
                    <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">생성일:</span>{' '}
                    {formatDateTime(version.createdAt)}
                    {version.creator && (
                      <>
                        {' '}
                        <span className="text-gray-500">| 생성자:</span> {version.creator.username}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {versions.length > 1 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const otherVersion = versions.find((v) => v.id !== version.id);
                        if (otherVersion) {
                          handleCompare(version, otherVersion);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <i className="fas fa-code-branch mr-1"></i>
                      비교
                    </Button>
                  )}
                  {!version.isActive && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedVersion(version);
                        setShowRollbackModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      롤백
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Version Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>버전 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 (선택사항)
              </label>
              <Input
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="예: 주요 설정 변경 전 백업"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                onClick={handleCreateVersion}
                disabled={isProcessing}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isProcessing ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="min-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>버전 비교</DialogTitle>
          </DialogHeader>
          {differences.length === 0 ? (
            <p className="text-gray-600">차이점이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                총 {differences.length}개의 차이점이 있습니다.
              </p>
              <div className="space-y-4">
                {differences.map((diff, idx) => (
                  <div key={idx} className="border rounded p-4 bg-gray-50">
                    <div className="font-medium text-gray-800 mb-2">
                      {diff.category}.{diff.key}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">이전 값:</span>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                          {JSON.stringify(diff.oldValue, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-gray-500">새 값:</span>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                          {JSON.stringify(diff.newValue, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button
              onClick={() => setShowCompareModal(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rollback Modal */}
      <Dialog open={showRollbackModal} onOpenChange={setShowRollbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>버전 롤백</DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <p className="text-gray-700">
                &quot;{selectedVersion.version}&quot; 버전으로 롤백하시겠습니까?
              </p>
              {selectedVersion.description && (
                <p className="text-sm text-gray-600">{selectedVersion.description}</p>
              )}
              <p className="text-sm text-red-600">
                현재 설정이 선택한 버전의 설정으로 대체됩니다.
              </p>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowRollbackModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleRollback(selectedVersion)}
                  disabled={isProcessing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {isProcessing ? '롤백 중...' : '롤백'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

