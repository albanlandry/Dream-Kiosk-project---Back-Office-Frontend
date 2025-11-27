'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ProjectItem } from '@/components/projects/ProjectItem';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { ViewProjectModal } from '@/components/projects/ViewProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { Pagination } from '@/components/ui/pagination';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';
import { projectsApi, type Project as ApiProject } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { PermissionGate } from '@/components/auth/permission-gate';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped';
  startDate: string;
  endDate?: string;
  kioskCount: number;
  contentPCCount: number;
  totalContent: number;
  totalRevenue: number;
  owner: string;
}

// Transform API project to UI project format
function transformProject(apiProject: ApiProject): Project {
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description || '',
    status: apiProject.status,
    startDate: typeof apiProject.startDate === 'string' ? apiProject.startDate : apiProject.startDate.toISOString().split('T')[0],
    endDate: apiProject.endDate 
      ? (typeof apiProject.endDate === 'string' ? apiProject.endDate : apiProject.endDate.toISOString().split('T')[0])
      : undefined,
    kioskCount: apiProject.kiosks?.length || 0,
    contentPCCount: (apiProject as any).contentPcs?.length || 0,
    totalContent: apiProject.totalContent || 0,
    totalRevenue: apiProject.totalRevenue || 0,
    owner: apiProject.owner,
  };
}

const ITEMS_PER_PAGE = 5;

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { showSuccess, showError, showWarning } = useToastStore();
  const router = useRouter();

  // Protect route with permission check
  useRoutePermission('project:read', '/dashboard');

  // Load projects from database on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const apiProjects = await projectsApi.getAll();
      const transformedProjects = apiProjects.map(transformProject);
      setProjects(transformedProjects);
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      showError('프로젝트를 불러오는데 실패했습니다.');
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const pausedProjects = projects.filter((p) => p.status === 'paused').length;
  const stoppedProjects = projects.filter((p) => p.status === 'stopped').length;

  // 페이지네이션 계산
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleManageContentPCs = (project?: Project) => {
    if (project) {
      router.push(`/dashboard/projects/content-pcs?projectId=${project.id}`);
    } else {
      router.push('/dashboard/projects/content-pcs');
    }
  };

  const handlePause = async (project: Project) => {
    if (confirm(`${project.name}을(를) 일시정지하시겠습니까?`)) {
      try {
        setLoadingMessage('프로젝트 일시정지 중...');
        setIsLoading(true);
        await projectsApi.update(project.id, { status: 'paused' });
        await loadProjects();
        showSuccess(`${project.name}이(가) 일시정지되었습니다.`);
      } catch (error: any) {
        console.error('Failed to pause project:', error);
        showError(error.response?.data?.message || '프로젝트 일시정지에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResume = async (project: Project) => {
    if (confirm(`${project.name}을(를) 재시작하시겠습니까?`)) {
      try {
        setLoadingMessage('프로젝트 재시작 중...');
        setIsLoading(true);
        await projectsApi.update(project.id, { status: 'active' });
        await loadProjects();
        showSuccess(`${project.name}이(가) 재시작되었습니다.`);
      } catch (error: any) {
        console.error('Failed to resume project:', error);
        showError(error.response?.data?.message || '프로젝트 재시작에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStop = async (project: Project) => {
    if (confirm(`${project.name}을(를) 종료하시겠습니까?`)) {
      try {
        setLoadingMessage('프로젝트 종료 중...');
        setIsLoading(true);
        const endDate = new Date().toISOString().split('T')[0];
        await projectsApi.update(project.id, { status: 'stopped', endDate });
        await loadProjects();
        showSuccess(`${project.name}이(가) 종료되었습니다.`);
      } catch (error: any) {
        console.error('Failed to stop project:', error);
        showError(error.response?.data?.message || '프로젝트 종료에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (project: Project) => {
    if (confirm(`${project.name}을(를) 삭제하시겠습니까?`)) {
      try {
        setLoadingMessage('프로젝트 삭제 중...');
        setIsLoading(true);
        await projectsApi.delete(project.id);
        await loadProjects();
        showSuccess(`${project.name}이(가) 삭제되었습니다.`);
      } catch (error: any) {
        console.error('Failed to delete project:', error);
        showError(error.response?.data?.message || '프로젝트 삭제에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="프로젝트 관리"
        description="프로젝트 생성, 설정 및 관리"
        action={
          <PermissionGate permission="project:create">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              새 프로젝트 생성
            </Button>
          </PermissionGate>
        }
      />
      <div className="p-8 min-h-screen">


        {/* 프로젝트 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<i className="fas fa-project-diagram"></i>}
            value={totalProjects}
            label="총 프로젝트"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={<i className="fas fa-play-circle"></i>}
            value={activeProjects}
            label="활성 프로젝트"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={<i className="fas fa-pause-circle"></i>}
            value={pausedProjects}
            label="일시정지"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={<i className="fas fa-stop-circle"></i>}
            value={stoppedProjects}
            label="종료됨"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
        </div>

        {/* Content PC Management Button */}
        <div className="mb-6 flex justify-end">
          <PermissionGate permission="content-pc:read">
            <Button
              onClick={() => handleManageContentPCs()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <i className="fas fa-desktop mr-2"></i>
              Content PC 관리
            </Button>
          </PermissionGate>
        </div>

        {/* 프로젝트 목록 */}
        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">프로젝트를 불러오는 중...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">프로젝트가 없습니다.</div>
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            {paginatedProjects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onView={handleView}
                onEdit={handleEdit}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mb-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddProjectModal
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            await loadProjects();
            setShowAddModal(false);
          }}
        />
      )}

      {viewingProject && (
        <ViewProjectModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={async () => {
            await loadProjects();
            setEditingProject(null);
          }}
        />
      )}

      {/* Loading Modal */}
      <LoadingModal isOpen={isLoading} message={loadingMessage} />
    </>
  );
}

