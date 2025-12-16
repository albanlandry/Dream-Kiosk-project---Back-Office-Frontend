'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { settingsApi } from '@/lib/api/settings';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

interface Backup {
  id: string;
  backupName: string;
  backupType: 'manual' | 'scheduled' | 'auto';
  storageLocation: string;
  storageType: 'local' | 's3';
  fileSize: number;
  createdAt: string;
  isRestored: boolean;
  restoredAt?: string;
  version?: {
    version: string;
    description?: string;
  };
}

export function SettingsBackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupName, setBackupName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getBackups(50);
      setBackups(data);
    } catch (error: any) {
      showError('백업 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      showError('백업 이름을 입력해주세요.');
      return;
    }

    try {
      setIsProcessing(true);
      await settingsApi.createBackup(backupName, 'manual');
      showSuccess('백업이 생성되었습니다.');
      setShowCreateModal(false);
      setBackupName('');
      loadBackups();
    } catch (error: any) {
      showError(error.response?.data?.message || '백업 생성에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (backup: Backup) => {
    if (!confirm(`"${backup.backupName}" 백업으로 복원하시겠습니까?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      await settingsApi.restoreBackup(backup.id);
      showSuccess('설정이 복원되었습니다.');
      setShowRestoreModal(false);
      setSelectedBackup(null);
      loadBackups();
    } catch (error: any) {
      showError(error.response?.data?.message || '복원에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">백업 및 복원</h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <i className="fas fa-plus mr-2"></i>
          백업 생성
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">백업 목록을 불러오는 중...</div>
      ) : backups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">백업이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="border rounded-lg p-4 hover:shadow-md transition-all bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{backup.backupName}</h4>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs',
                        backup.backupType === 'manual'
                          ? 'bg-blue-100 text-blue-800'
                          : backup.backupType === 'scheduled'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800',
                      )}
                    >
                      {backup.backupType === 'manual'
                        ? '수동'
                        : backup.backupType === 'scheduled'
                          ? '예약'
                          : '자동'}
                    </span>
                    {backup.isRestored && (
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        복원됨
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">크기:</span> {formatFileSize(backup.fileSize)}
                    </div>
                    <div>
                      <span className="text-gray-500">저장소:</span>{' '}
                      {backup.storageType === 's3' ? 'S3' : '로컬'}
                    </div>
                    <div>
                      <span className="text-gray-500">생성일:</span>{' '}
                      {formatDateTime(backup.createdAt)}
                    </div>
                    {backup.version && (
                      <div>
                        <span className="text-gray-500">버전:</span> {backup.version.version}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedBackup(backup);
                    setShowRestoreModal(true);
                  }}
                  disabled={backup.isRestored}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <i className="fas fa-undo mr-1"></i>
                  복원
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Backup Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>백업 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                백업 이름
              </label>
              <Input
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="예: 설정 백업 2024-12-22"
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
                onClick={handleCreateBackup}
                disabled={isProcessing}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isProcessing ? '생성 중...' : '생성'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Modal */}
      <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>백업 복원</DialogTitle>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <p className="text-gray-700">
                &quot;{selectedBackup.backupName}&quot; 백업으로 복원하시겠습니까?
              </p>
              <p className="text-sm text-gray-500">
                현재 설정이 백업된 설정으로 대체됩니다.
              </p>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowRestoreModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleRestore(selectedBackup)}
                  disabled={isProcessing}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {isProcessing ? '복원 중...' : '복원'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

