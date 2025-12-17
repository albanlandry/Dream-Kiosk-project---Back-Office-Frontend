'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { usePermissions } from '@/lib/contexts/permission-context';
import { Header } from '@/components/layout/Header';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { ActivityLogsFiltersV2 } from '@/components/dashboard/ActivityLogsFiltersV2';
import { ActivityLogsPagination } from '@/components/dashboard/ActivityLogsPagination';
import { SortButton } from '@/components/dashboard/SortButton';
import { Button } from '@/components/ui/button';
import { Download, Archive, Trash2, RefreshCw } from 'lucide-react';
import { activityLogsApi } from '@/lib/api/activity-logs';
import { useToastStore } from '@/lib/store/toastStore';
import { useActivityLogsUIStore } from '@/lib/store/activityLogsUIStore';
import { useActivityLogsSelectionStore } from '@/lib/store/activityLogsSelectionStore';
import { formatActivityLogs } from '@/lib/utils/activity-formatter';
import { ActivityLog } from '@/lib/api/activity-logs';

export default function ActivityLogsPage() {
  useRoutePermission('activity_logs:read', '/dashboard');
  const { hasPermission } = usePermissions();
  const { showSuccess, showError, showInfo } = useToastStore();

  // UI State Management
  const {
    filters,
    sortOrder,
    startDate: storedStartDate,
    endDate: storedEndDate,
    setFilters,
    updateFilter,
    setSortOrder,
    setDateRange,
  } = useActivityLogsUIStore();

  // Selection Management
  const selectedCount = useActivityLogsSelectionStore((state) => state.getSelectedCount());
  const clearSelection = useActivityLogsSelectionStore((state) => state.clearSelection);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Convert stored date strings to Date objects
  const startDate = useMemo(() => {
    return storedStartDate ? new Date(storedStartDate) : undefined;
  }, [storedStartDate]);

  const endDate = useMemo(() => {
    return storedEndDate ? new Date(storedEndDate) : undefined;
  }, [storedEndDate]);

  // Format logs for display
  const formattedActivities = useMemo(() => {
    return formatActivityLogs(logs);
  }, [logs]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await activityLogsApi.query({
        ...filters,
        page: filters.page,
        limit: filters.limit,
        sort: sortOrder === 'desc' ? '-createdAt' : '+createdAt',
      });
      setLogs(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error: any) {
      console.error('Failed to load activity logs:', error);
      showError('활동 로그를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters, sortOrder]);

  const handleExport = async () => {
    if (!hasPermission('activity_logs:export')) {
      showError('내보내기 권한이 없습니다');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/v1/activity-logs/export/sync/json?${params.toString()}`;
      
      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activity-logs.json');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('내보내기가 시작되었습니다');
    } catch (error) {
      console.error('Export failed:', error);
      showError('내보내기에 실패했습니다');
    }
  };

  const handleArchive = async () => {
    if (!hasPermission('activity_logs:archive')) {
      showError('아카이브 권한이 없습니다');
      return;
    }

    try {
      // TODO: Implement archive functionality
      showInfo('아카이브 기능은 곧 제공될 예정입니다');
    } catch (error) {
      console.error('Archive failed:', error);
      showError('아카이브에 실패했습니다');
    }
  };

  const handleDelete = async () => {
    if (!hasPermission('activity_logs:delete')) {
      showError('삭제 권한이 없습니다');
      return;
    }

    if (!confirm('선택한 로그를 삭제하시겠습니까?')) {
      return;
    }

    try {
      // TODO: Implement delete functionality
      showInfo('삭제 기능은 곧 제공될 예정입니다');
    } catch (error) {
      console.error('Delete failed:', error);
      showError('삭제에 실패했습니다');
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="활동 로그 관리"
        description="시스템의 모든 활동 로그를 조회하고 관리할 수 있습니다"
        action={
          <div className="flex gap-2">
            {hasPermission('activity_logs:export') && (
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            )}
            {hasPermission('activity_logs:archive') && (
              <Button onClick={handleArchive} variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                아카이브
              </Button>
            )}
            {hasPermission('activity_logs:delete') && (
              <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            )}
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">로그 필터</h2>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <span>{selectedCount}개 선택됨</span>
                <button
                  onClick={clearSelection}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                  title="선택 해제"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <SortButton sortOrder={sortOrder} onSortChange={setSortOrder} />
        </div>

        <ActivityLogsFiltersV2
          filters={filters}
          onFiltersChange={(newFilters) => {
            // Reset to page 1 when filters change (except page changes)
            setFilters({
              ...newFilters,
              page: newFilters.page || 1,
            });
          }}
          onLimitChange={(limit) => {
            updateFilter('limit', limit);
            updateFilter('page', 1);
          }}
          onDateRangeChange={(start, end) => {
            setDateRange(start, end);
          }}
          limit={filters.limit || 50}
          startDate={startDate}
          endDate={endDate}
        />

        <div className="mt-6">
          <ActivityList
            activities={formattedActivities}
            logs={logs}
            isLoading={isLoading}
            emptyMessage="선택한 필터 조건에 맞는 활동이 없습니다."
          />
        </div>

        {pagination.totalPages > 0 && pagination.total > 0 && (
          <div className="mt-6">
            <ActivityLogsPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateFilter('page', page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

