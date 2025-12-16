'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { useDashboardWebSocket } from '@/lib/hooks/useDashboardWebSocket';
import { useActivityLogs } from '@/lib/hooks/useActivityLogs';
import { ProjectSelect } from '@/components/projects/ProjectSelect';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { ActivityLogsFilters } from '@/components/dashboard/ActivityLogsFilters';
import { ActivityLogsPagination } from '@/components/dashboard/ActivityLogsPagination';
import { formatActivityLogs } from '@/lib/utils/activity-formatter';
import { ActivityLogFilters } from '@/lib/api/activity-logs';
import { useEffect, useState, useMemo } from 'react';
import { Wifi, WifiOff, Loader2, ArrowUpDown } from 'lucide-react';

export default function DashboardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Activity Logs filters and pagination state
  const [activityFilters, setActivityFilters] = useState<ActivityLogFilters>({
    page: 1,
    limit: 10,
  });
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityStartDate, setActivityStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default: last 7 days for activities
    return date;
  });
  const [activityEndDate, setActivityEndDate] = useState<Date | undefined>(new Date());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 'desc' = newest first

  // Real-time WebSocket connection
  const { isConnected } = useDashboardWebSocket(selectedProjectId || undefined);

  // Statistics with filters
  const { data: statistics, isLoading } = useStatistics(
    {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      projectId: selectedProjectId || undefined,
    },
    {
      refetchInterval: 10000, // Real-time updates every 10 seconds
    }
  );

  // Activity logs with filters and pagination
  const activityLogsQuery = useActivityLogs(
    {
      ...activityFilters,
      limit: activityLimit,
      startDate: activityStartDate?.toISOString(),
      endDate: activityEndDate?.toISOString(),
      ...(selectedProjectId && {
        resourceType: 'project',
        resourceId: selectedProjectId,
      }),
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    }
  );

  // Format activity logs for display with sorting
  const recentActivities = useMemo(() => {
    if (!activityLogsQuery.data?.data) {
      return [];
    }

    let logs = [...activityLogsQuery.data.data];

    // Sort by date (createdAt or occurredAt)
    logs.sort((a, b) => {
      const dateA = new Date(a.occurredAt || a.createdAt).getTime();
      const dateB = new Date(b.occurredAt || b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return formatActivityLogs(logs);
  }, [activityLogsQuery.data, sortOrder]);

  // Generate chart data (mock data for now - can be replaced with real API data)
  const revenueChartData = useMemo(() => {
    const days = 30;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      // Mock data: random revenue between 100000 and 500000
      values.push(Math.floor(Math.random() * 400000) + 100000);
    }

    return { labels, values };
  }, [startDate, endDate]);

  const contentChartData = useMemo(() => {
    const days = 30;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      // Mock data: random content count between 5 and 50
      values.push(Math.floor(Math.random() * 45) + 5);
    }

    return { labels, values };
  }, [startDate, endDate]);

  // Calculate statistics from current data
  const totalContent = statistics?.videos?.total || 0;
  const totalRevenue = 2456789; // Mock revenue - should come from API
  const activeUsers = 567; // Mock users - should come from API
  const activeKiosks = statistics?.videos?.ready || 0;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="대시보드"
        description="Dream Piece System 현황"
      />
      <div className="p-8 min-h-screen">
        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 선택
              </label>
              <ProjectSelect
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                placeholder="전체 프로젝트"
              />
            </div>
            <div className="w-full sm:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 범위
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600">실시간 연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">연결 끊김</span>
              </>
            )}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<i className="fas fa-video"></i>}
            value={totalContent}
            label="생성된 콘텐츠"
            change={{ value: '+12%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <StatCard
            icon={<i className="fas fa-credit-card"></i>}
            value={`₩${totalRevenue.toLocaleString()}`}
            label="총 매출"
            change={{ value: '+8%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-pink-500 to-red-500"
          />
          <StatCard
            icon={<i className="fas fa-users"></i>}
            value={activeUsers}
            label="활성 사용자"
            change={{ value: '+15%', type: 'positive' }}
            iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<i className="fas fa-desktop"></i>}
            value={activeKiosks}
            label="활성 키오스크"
            change={{ value: '0%', type: 'neutral' }}
            iconBg="bg-gradient-to-br from-green-400 to-teal-500"
          />
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">일별 매출 추이</h3>
            <div className="h-64">
              <RevenueChart data={revenueChartData} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">콘텐츠 생성 현황</h3>
            <div className="h-64">
              <ContentChart data={contentChartData} />
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-xl p-6 shadow-sm" data-activity-section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800">최근 활동</h3>
            <div className="flex items-center gap-3">
              {/* Sort Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title={sortOrder === 'desc' ? '오래된 순으로 정렬' : '최신 순으로 정렬'}
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="text-xs">
                  {sortOrder === 'desc' ? '최신순' : '오래된순'}
                </span>
              </button>
              {activityLogsQuery.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          {/* Filters */}
          <ActivityLogsFilters
            filters={activityFilters}
            onFiltersChange={setActivityFilters}
            onLimitChange={setActivityLimit}
            onDateRangeChange={(start, end) => {
              setActivityStartDate(start);
              setActivityEndDate(end);
            }}
            limit={activityLimit}
            startDate={activityStartDate}
            endDate={activityEndDate}
          />

          {/* Activity List */}
          <div className="space-y-4">
            {activityLogsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">활동 로드 중...</span>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">선택한 필터 조건에 맞는 활동이 없습니다.</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id || `activity-${activity.title}-${activity.time}`}
                  className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 ${activity.borderColor}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center text-white`}>
                    <i className={activity.icon}></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-1">{activity.title}</p>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {activityLogsQuery.data?.pagination && (
            <ActivityLogsPagination
              currentPage={activityLogsQuery.data.pagination.page}
              totalPages={activityLogsQuery.data.pagination.totalPages}
              total={activityLogsQuery.data.pagination.total}
              limit={activityLogsQuery.data.pagination.limit}
              onPageChange={(page) => {
                setActivityFilters((prev) => ({ ...prev, page }));
                // Scroll to top of activity section
                document
                  .querySelector('[data-activity-section]')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
