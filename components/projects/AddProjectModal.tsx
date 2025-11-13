'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/app/dashboard/projects/page';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';

interface AddProjectModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export function AddProjectModal({ onClose, onSuccess }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    location: '',
    owner: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/projects', {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        location: formData.location,
        owner: formData.owner,
      });

      const newProject: Project = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description || '',
        status: response.data.status || 'active',
        startDate: response.data.startDate || formData.startDate,
        kioskCount: response.data.kiosks?.length || 0,
        contentPCCount: 0, // Will be updated from API
        totalContent: response.data.totalContent || 0,
        totalRevenue: response.data.totalRevenue || 0,
        owner: response.data.owner,
        location: response.data.location,
      };

      showSuccess('프로젝트가 성공적으로 생성되었습니다.');
      onSuccess(newProject);
    } catch (error: any) {
      showError(error.response?.data?.message || '프로젝트 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>새 프로젝트 생성</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 강남점 프로젝트"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="프로젝트에 대한 설명을 입력하세요."
                rows={4}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                소유자 *
              </label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="프로젝트 소유자 이름"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                시작일 *
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="mm/dd/yyyy"
                  required
                  className="w-full pr-10"
                />
                <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                위치 *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 대전점 - 1층 로비"
                required
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

