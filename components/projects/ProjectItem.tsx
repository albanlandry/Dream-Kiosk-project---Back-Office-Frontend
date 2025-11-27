'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Project } from '@/app/dashboard/projects/page';
import { PermissionGate } from '@/components/auth/permission-gate';

interface ProjectItemProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onPause: (project: Project) => void;
  onResume: (project: Project) => void;
  onStop: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectItem({
  project,
  onView,
  onEdit,
  onPause,
  onResume,
  onStop,
  onDelete,
}: ProjectItemProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'paused':
        return '일시정지';
      case 'stopped':
        return '종료됨';
      default:
        return status;
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-1">{project.name}</h4>
            <p className="text-sm text-gray-600">{project.description}</p>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold',
              getStatusClass(project.status)
            )}
          >
            {getStatusText(project.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <span className="text-sm font-semibold text-gray-800">시작일:</span>
            <p className="text-sm text-gray-600">{project.startDate}</p>
          </div>
          {project.endDate && (
            <div>
              <span className="text-sm font-semibold text-gray-800">종료일:</span>
              <p className="text-sm text-gray-600">{project.endDate}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-semibold text-gray-800">키오스크:</span>
            <p className="text-sm text-gray-600">{project.kioskCount}대</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">Content PC:</span>
            <p className="text-sm text-gray-600">{project.contentPCCount}대</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">총 콘텐츠:</span>
            <p className="text-sm text-gray-600">{project.totalContent}개</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">총 매출:</span>
            <p className="text-sm text-gray-600">₩{project.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-800">소유자:</span>
            <p className="text-sm text-gray-600">{project.owner}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <PermissionGate permission="project:read">
            <Button
              onClick={() => onView(project)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              <i className="fas fa-eye mr-2"></i>상세보기
            </Button>
          </PermissionGate>
          <PermissionGate permission="project:update">
            <Button
              onClick={() => onEdit(project)}
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
            >
              <i className="fas fa-cog mr-2"></i>설정
            </Button>
          </PermissionGate>
          {project.status === 'active' && (
            <>
              <PermissionGate permission="project:pause">
                <Button
                  onClick={() => onPause(project)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                >
                  <i className="fas fa-pause mr-2"></i>일시정지
                </Button>
              </PermissionGate>
              <PermissionGate permission="project:stop">
                <Button
                  onClick={() => onStop(project)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  <i className="fas fa-stop mr-2"></i>종료
                </Button>
              </PermissionGate>
            </>
          )}
          {project.status === 'paused' && (
            <>
              <PermissionGate permission="project:resume">
                <Button
                  onClick={() => onResume(project)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm"
                >
                  <i className="fas fa-play mr-2"></i>재시작
                </Button>
              </PermissionGate>
              <PermissionGate permission="project:stop">
                <Button
                  onClick={() => onStop(project)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  <i className="fas fa-stop mr-2"></i>종료
                </Button>
              </PermissionGate>
            </>
          )}
          {project.status === 'stopped' && (
            <>
              <PermissionGate permission="project:read">
                <Button
                  onClick={() => onView(project)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                >
                  <i className="fas fa-download mr-2"></i>리포트
                </Button>
              </PermissionGate>
              <PermissionGate permission="project:delete">
                <Button
                  onClick={() => onDelete(project)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  <i className="fas fa-trash mr-2"></i>삭제
                </Button>
              </PermissionGate>
            </>
          )}
        </div>
      </div>
    </>
  );
}

