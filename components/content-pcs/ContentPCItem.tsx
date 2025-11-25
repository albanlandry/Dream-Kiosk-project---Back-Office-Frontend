'use client';

import { Button } from '@/components/ui/button';
import { ContentPC } from '@/lib/api/content-pcs';
import { cn } from '@/lib/utils/cn';

interface ContentPCItemProps {
  pc: ContentPC;
  projects: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onDelete: () => void;
  onAttach: (projectId: string) => void;
  onDetach: () => void;
  onStart: () => void;
  onRestart: () => void;
  onViewResources: () => void;
}

export function ContentPCItem({
  pc,
  projects,
  onEdit,
  onDelete,
  onAttach,
  onDetach,
  onStart,
  onRestart,
  onViewResources,
}: ContentPCItemProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      online: { label: '온라인', className: 'bg-green-100 text-green-800' },
      offline: { label: '오프라인', className: 'bg-red-100 text-red-800' },
      maintenance: { label: '점검 중', className: 'bg-yellow-100 text-yellow-800' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.offline;

    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusInfo.className)}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">{pc.name}</h4>
          <p className="text-sm text-gray-600">
            프로젝트: {pc.project?.name || '미할당'}
            {pc.ipAddress && ` · IP: ${pc.ipAddress}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(pc.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">디스플레이:</span>
          <p className="font-medium text-gray-800">{pc.displayCount}대</p>
        </div>
        <div>
          <span className="text-gray-600">마지막 연결:</span>
          <p className="font-medium text-gray-800">{formatDate(pc.lastConnectedAt)}</p>
        </div>
        <div>
          <span className="text-gray-600">대기 스케줄:</span>
          <p className="font-medium text-gray-800">{pc.waitingScheduleCount || 0}개</p>
        </div>
        <div>
          <span className="text-gray-600">자동 시작:</span>
          <p className="font-medium text-gray-800">{pc.autoStart ? '예' : '아니오'}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={onViewResources}
        >
          <i className="fas fa-chart-line mr-1"></i>
          리소스
        </Button>
        {pc.status === 'offline' ? (
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={onStart}
          >
            <i className="fas fa-play mr-1"></i>
            시작
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={onRestart}
          >
            <i className="fas fa-redo mr-1"></i>
            재시작
          </Button>
        )}
        <Button
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white"
          onClick={onEdit}
        >
          <i className="fas fa-edit mr-1"></i>
          수정
        </Button>
        {pc.projectId ? (
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={onDetach}
          >
            <i className="fas fa-unlink mr-1"></i>
            분리
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={() => {
              // Show project selection dialog
              const projectId = prompt('프로젝트 ID를 입력하세요:');
              if (projectId) onAttach(projectId);
            }}
          >
            <i className="fas fa-link mr-1"></i>
            연결
          </Button>
        )}
        <Button
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={onDelete}
        >
          <i className="fas fa-trash mr-1"></i>
          삭제
        </Button>
      </div>
    </div>
  );
}

