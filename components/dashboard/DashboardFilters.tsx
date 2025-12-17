'use client';

import { ProjectSelect } from '@/components/projects/ProjectSelect';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ConnectionStatus } from './ConnectionStatus';

interface DashboardFiltersProps {
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (start?: Date, end?: Date) => void;
  isConnected: boolean;
}

export function DashboardFilters({
  selectedProjectId,
  onProjectChange,
  startDate,
  endDate,
  onDateRangeChange,
  isConnected,
}: DashboardFiltersProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택</label>
          <ProjectSelect
            value={selectedProjectId}
            onChange={onProjectChange}
            placeholder="전체 프로젝트"
          />
        </div>
        <div className="w-full sm:w-80">
          <label className="block text-sm font-medium text-gray-700 mb-2">날짜 범위</label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={onDateRangeChange}
          />
        </div>
      </div>
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}

