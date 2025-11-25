'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ContentPc {
  id: string;
  name: string;
  projectId: string;
  ipAddress: string | null;
  displayCount: number;
  status: 'online' | 'offline' | 'maintenance';
  lastConnectedAt: string | null;
  currentScheduleId: string | null;
  waitingScheduleCount: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStatus: string | null;
  project?: {
    id: string;
    name: string;
  };
}

interface Schedule {
  id: string;
  authorName: string | null;
}

interface ContentPCItemProps {
  pc: ContentPc;
  schedules: Schedule[];
  onMonitoring?: (id: string) => void;
  onSettings?: (id: string) => void;
  onRestart?: (id: string) => void;
  onRepair?: (id: string) => void;
  formatDateTime: (dateString: string) => string;
}

export function ContentPCItem({
  pc,
  schedules,
  onMonitoring,
  onSettings,
  onRestart,
  onRepair,
  formatDateTime,
}: ContentPCItemProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{pc.name}</h4>
          <p className="text-sm text-gray-600">{pc.project?.name || '프로젝트 없음'}</p>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            pc.status === 'online'
              ? 'bg-green-100 text-green-800'
              : pc.status === 'offline'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800',
          )}
        >
          {pc.status === 'online'
            ? '온라인'
            : pc.status === 'offline'
              ? '오프라인'
              : '점검 중'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <span className="text-sm text-gray-600">IP 주소:</span>
          <p className="text-sm font-medium text-gray-800">{pc.ipAddress || 'N/A'}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">디스플레이:</span>
          <p className="text-sm font-medium text-gray-800">{pc.displayCount}대</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">
            {pc.status === 'online' ? '현재 재생:' : '마지막 연결:'}
          </span>
          <p className="text-sm font-medium text-gray-800">
            {pc.status === 'online'
              ? schedules.find((s) => s.id === pc.currentScheduleId)?.authorName || '없음'
              : pc.lastConnectedAt
                ? formatDateTime(pc.lastConnectedAt)
                : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-600">대기 스케줄:</span>
          <p className="text-sm font-medium text-gray-800">{pc.waitingScheduleCount}개</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => onMonitoring?.(pc.id)}
        >
          <i className="fas fa-eye mr-1"></i>
          모니터링
        </Button>
        <Button
          size="sm"
          className="bg-gray-500 hover:bg-gray-600 text-white"
          onClick={() => onSettings?.(pc.id)}
        >
          <i className="fas fa-cog mr-1"></i>
          설정
        </Button>
        <Button
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={() => onRestart?.(pc.id)}
        >
          <i className="fas fa-sync mr-1"></i>
          재시작
        </Button>
        {pc.status === 'offline' && (
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onRepair?.(pc.id)}
          >
            <i className="fas fa-tools mr-1"></i>
            수리 요청
          </Button>
        )}
      </div>
    </div>
  );
}

