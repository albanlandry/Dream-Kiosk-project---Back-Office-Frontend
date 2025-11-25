'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contentPcsApi, ContentPC, UpdateContentPCDto } from '@/lib/api/content-pcs';
import { useToastStore } from '@/lib/store/toastStore';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { projectsApi } from '@/lib/api/projects';
import { useEffect } from 'react';

interface EditContentPCModalProps {
  pc: ContentPC;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditContentPCModal({ pc, onClose, onSuccess }: EditContentPCModalProps) {
  const [formData, setFormData] = useState<UpdateContentPCDto>({
    name: pc.name,
    projectId: pc.projectId || undefined,
    ipAddress: pc.ipAddress,
    displayCount: pc.displayCount,
    autoStart: pc.autoStart,
    updateInterval: pc.updateInterval,
    volume: pc.volume,
    brightness: pc.brightness,
    displayMode: pc.displayMode,
  });
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectList = await projectsApi.getAll();
      setProjects(projectList);
      const options: SearchableSelectOption[] = [
        { id: 'none', label: '프로젝트 없음', value: '' },
        ...projectList.map((p) => ({
          id: p.id,
          label: p.name,
          value: p.id,
        })),
      ];
      setProjectOptions(options);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showError('이름은 필수 항목입니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await contentPcsApi.update(pc.id, formData);
      showSuccess('Content PC가 수정되었습니다.');
      onSuccess();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Content PC 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content PC 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트</label>
            <SearchableSelect
              options={projectOptions}
              value={formData.projectId || ''}
              onChange={(value) => setFormData({ ...formData, projectId: value || undefined })}
              placeholder="프로젝트 선택 (선택사항)"
              searchPlaceholder="프로젝트 검색..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IP 주소</label>
            <Input
              value={formData.ipAddress || ''}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">디스플레이 수</label>
              <Input
                type="number"
                min="1"
                value={formData.displayCount}
                onChange={(e) =>
                  setFormData({ ...formData, displayCount: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">업데이트 간격 (초)</label>
              <Input
                type="number"
                min="10"
                value={formData.updateInterval}
                onChange={(e) =>
                  setFormData({ ...formData, updateInterval: parseInt(e.target.value) || 30 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">볼륨 (0-100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.volume}
                onChange={(e) =>
                  setFormData({ ...formData, volume: parseInt(e.target.value) || 80 })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">밝기 (0-100)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.brightness}
                onChange={(e) =>
                  setFormData({ ...formData, brightness: parseInt(e.target.value) || 100 })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">디스플레이 모드</label>
            <select
              value={formData.displayMode}
              onChange={(e) =>
                setFormData({ ...formData, displayMode: e.target.value as 'fullscreen' | 'windowed' })
              }
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="fullscreen">전체 화면</option>
              <option value="windowed">창 모드</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoStart}
                onChange={(e) => setFormData({ ...formData, autoStart: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">부팅 시 자동 시작</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isSubmitting ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    );
}

