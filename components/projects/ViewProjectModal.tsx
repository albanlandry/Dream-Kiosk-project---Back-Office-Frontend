'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Project } from '@/app/dashboard/projects/page';
import { cn } from '@/lib/utils/cn';

interface ViewProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ViewProjectModal({ project, onClose }: ViewProjectModalProps) {
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

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>프로젝트 상세 정보</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{project.name}</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
              <span
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-semibold',
                  getStatusClass(project.status)
                )}
              >
                {getStatusText(project.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  시작일
                </label>
                <p className="text-gray-800">{project.startDate}</p>
              </div>
              {project.endDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    종료일
                  </label>
                  <p className="text-gray-800">{project.endDate}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  키오스크 수
                </label>
                <p className="text-gray-800">{project.kioskCount}대</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Content PC 수
                </label>
                <p className="text-gray-800">{project.contentPCCount}대</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  총 콘텐츠
                </label>
                <p className="text-gray-800">{project.totalContent}개</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  총 매출
                </label>
                <p className="text-gray-800">₩{project.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  소유자
                </label>
                <p className="text-gray-800">{project.owner}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

