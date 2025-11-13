'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ProjectItem } from '@/components/projects/ProjectItem';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { ViewProjectModal } from '@/components/projects/ViewProjectModal';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { Pagination } from '@/components/ui/pagination';

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

const mockProjects: Project[] = [
  {
    id: '1',
    name: '강남점 프로젝트',
    description: '강남점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-11-01',
    kioskCount: 2,
    contentPCCount: 4,
    totalContent: 456,
    totalRevenue: 1234567,
    owner: '김철수',
  },
  {
    id: '2',
    name: '홍대점 프로젝트',
    description: '홍대점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-11-15',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 234,
    totalRevenue: 567890,
    owner: '이영희',
  },
  {
    id: '3',
    name: '부산점 프로젝트',
    description: '부산점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-12-01',
    kioskCount: 1,
    contentPCCount: 3,
    totalContent: 123,
    totalRevenue: 345678,
    owner: '박민수',
  },
  {
    id: '4',
    name: '대구점 프로젝트',
    description: '대구점 키오스크 운영 프로젝트',
    status: 'paused',
    startDate: '2024-10-15',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 89,
    totalRevenue: 234567,
    owner: '최지영',
  },
  {
    id: '5',
    name: '인천점 프로젝트',
    description: '인천점 키오스크 운영 프로젝트',
    status: 'stopped',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 156,
    totalRevenue: 456789,
    owner: '정수진',
  },
  {
    id: '6',
    name: '수원점 프로젝트',
    description: '수원점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-12-05',
    kioskCount: 2,
    contentPCCount: 3,
    totalContent: 267,
    totalRevenue: 789012,
    owner: '한미영',
  },
  {
    id: '7',
    name: '광주점 프로젝트',
    description: '광주점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-11-20',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 178,
    totalRevenue: 456123,
    owner: '송대현',
  },
  {
    id: '8',
    name: '대전점 프로젝트',
    description: '대전점 키오스크 운영 프로젝트',
    status: 'paused',
    startDate: '2024-10-10',
    kioskCount: 1,
    contentPCCount: 1,
    totalContent: 67,
    totalRevenue: 123456,
    owner: '윤서연',
  },
  {
    id: '9',
    name: '울산점 프로젝트',
    description: '울산점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-12-10',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 145,
    totalRevenue: 345789,
    owner: '강민호',
  },
  {
    id: '10',
    name: '제주점 프로젝트',
    description: '제주점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-11-25',
    kioskCount: 1,
    contentPCCount: 2,
    totalContent: 98,
    totalRevenue: 234567,
    owner: '오지은',
  },
  {
    id: '11',
    name: '천안점 프로젝트',
    description: '천안점 키오스크 운영 프로젝트',
    status: 'active',
    startDate: '2024-12-08',
    kioskCount: 1,
    contentPCCount: 1,
    totalContent: 76,
    totalRevenue: 189234,
    owner: '임동욱',
  },
  {
    id: '12',
    name: '청주점 프로젝트',
    description: '청주점 키오스크 운영 프로젝트',
    status: 'stopped',
    startDate: '2024-08-15',
    endDate: '2024-10-30',
    kioskCount: 1,
    contentPCCount: 1,
    totalContent: 45,
    totalRevenue: 98765,
    owner: '조은혜',
  },
];

const ITEMS_PER_PAGE = 5;

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  const handlePause = (project: Project) => {
    if (confirm(`${project.name}을(를) 일시정지하시겠습니까?`)) {
      setProjects(
        projects.map((p) => (p.id === project.id ? { ...p, status: 'paused' as const } : p))
      );
      alert('프로젝트가 일시정지되었습니다.');
    }
  };

  const handleResume = (project: Project) => {
    if (confirm(`${project.name}을(를) 재시작하시겠습니까?`)) {
      setProjects(
        projects.map((p) => (p.id === project.id ? { ...p, status: 'active' as const } : p))
      );
      alert('프로젝트가 재시작되었습니다.');
    }
  };

  const handleStop = (project: Project) => {
    if (confirm(`${project.name}을(를) 종료하시겠습니까?`)) {
      setProjects(
        projects.map((p) =>
          p.id === project.id
            ? { ...p, status: 'stopped' as const, endDate: new Date().toISOString().split('T')[0] }
            : p
        )
      );
      alert('프로젝트가 종료되었습니다.');
    }
  };

  const handleDelete = (project: Project) => {
    if (confirm(`${project.name}을(를) 삭제하시겠습니까?`)) {
      setProjects(projects.filter((p) => p.id !== project.id));
      alert('프로젝트가 삭제되었습니다.');
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
        action={{
          label: '새 프로젝트 생성',
          icon: 'fas fa-plus',
          onClick: () => setShowAddModal(true),
        }}
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

        {/* 프로젝트 목록 */}
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
          onSuccess={(newProject) => {
            setProjects([...projects, newProject]);
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
          onSuccess={(updatedProject) => {
            setProjects(projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
            setEditingProject(null);
          }}
        />
      )}
    </>
  );
}

