'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, type Project as ApiProject } from '@/lib/api/projects';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { PermissionGate } from '@/components/auth/permission-gate';
import { ProjectsPageSkeleton } from '@/components/skeletons/ProjectsPageSkeleton';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<ApiProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    owner: '',
    startDate: '',
    endDate: '',
  });
  const { showSuccess, showError } = useToastStore();

  // Protect route with permission check
  useRoutePermission('project:update', '/dashboard/projects');

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectData = await projectsApi.getById(projectId);
      setProject(projectData);
      setFormData({
        name: projectData.name,
        description: projectData.description || '',
        location: projectData.location,
        owner: projectData.owner,
        startDate: typeof projectData.startDate === 'string' 
          ? projectData.startDate 
          : projectData.startDate.toISOString().split('T')[0],
        endDate: projectData.endDate 
          ? (typeof projectData.endDate === 'string' 
              ? projectData.endDate 
              : projectData.endDate.toISOString().split('T')[0])
          : '',
      });
    } catch (error: any) {
      console.error('Failed to load project:', error);
      showError('프로젝트를 불러오는데 실패했습니다.');
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, showError, router]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await projectsApi.update(projectId, {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        owner: formData.owner,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });

      showSuccess('프로젝트 설정이 성공적으로 저장되었습니다.');
      await loadProject();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      showError(error.response?.data?.message || '프로젝트 설정 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ProjectsPageSkeleton />;
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title={`${project.name} - 설정`}
        description="프로젝트 설정 및 관리"
        action={
          <Button
            onClick={() => router.push('/dashboard/projects')}
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            목록으로
          </Button>
        }
      />
      <div className="p-8 min-h-screen">
        <PermissionGate permission="project:update">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">프로젝트 기본 정보</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    소유자 *
                  </label>
                  <Input
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
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
                    종료일
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/projects')}
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
          </div>

          {/* 프로젝트 통계 */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">프로젝트 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">키오스크 수</p>
                <p className="text-2xl font-bold text-gray-800">{project.kiosks?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Content PC 수</p>
                <p className="text-2xl font-bold text-gray-800">{project.contentPcs?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 콘텐츠</p>
                <p className="text-2xl font-bold text-gray-800">{project.totalContent || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 매출</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₩{project.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>

      <LoadingModal isOpen={isSubmitting} message="프로젝트 설정 저장 중..." />
    </>
  );
}

