'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/app/dashboard/projects/page';
import { projectsApi, type Project as ApiProject } from '@/lib/api/projects';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    owner: project.owner,
    location: (project as any).location || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      
      // API call to update project
      const updatedProject = await projectsApi.update(project.id, {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        owner: formData.owner,
        location: formData.location,
      });

      showSuccess('프로젝트가 성공적으로 수정되었습니다.');
      
      // Transform API project to UI project format
      const transformedProject: Project = {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description || '',
        status: updatedProject.status,
        startDate: typeof updatedProject.startDate === 'string' 
          ? updatedProject.startDate 
          : updatedProject.startDate.toISOString().split('T')[0],
        endDate: updatedProject.endDate 
          ? (typeof updatedProject.endDate === 'string' 
              ? updatedProject.endDate 
              : updatedProject.endDate.toISOString().split('T')[0])
          : undefined,
        kioskCount: updatedProject.kiosks?.length || 0,
        contentPCCount: updatedProject.contentPcs?.length || 0,
        totalContent: updatedProject.totalContent || 0,
        totalRevenue: updatedProject.totalRevenue || 0,
        owner: updatedProject.owner,
      };

      onSuccess(transformedProject);
    } catch (error: any) {
      console.error('Failed to update project:', error);
      showError(error.response?.data?.message || '프로젝트 수정에 실패했습니다.');
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
            <DialogTitle>프로젝트 설정</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  위치 *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 서울시 강남구"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  시작일 *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  소유자 *
                </label>
                <Input
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <LoadingModal isOpen={isSubmitting} message="프로젝트 수정 중..." />
    </>
  );
}

