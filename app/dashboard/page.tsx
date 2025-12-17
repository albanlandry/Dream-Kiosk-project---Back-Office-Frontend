'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { useDashboardWebSocket } from '@/lib/hooks/useDashboardWebSocket';
import { useActivityLogs } from '@/lib/hooks/useActivityLogs';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ActivitySection } from '@/components/dashboard/ActivitySection';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { formatActivityLogs } from '@/lib/utils/activity-formatter';
import { ActivityLogFilters } from '@/lib/api/activity-logs';
import { useState, useMemo } from 'react';

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
    limit: 5, // Default: 5 items
  });
  const [activityLimit, setActivityLimit] = useState(5); // Default: 5 items
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
  const { data: statistics } = useStatistics(
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

    const logs = [...activityLogsQuery.data.data];

    // Sort by date (createdAt or occurredAt)
    logs.sort((a, b) => {
      const dateA = new Date(a.occurredAt || a.createdAt).getTime();
      const dateB = new Date(b.occurredAt || b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return formatActivityLogs(logs);
  }, [activityLogsQuery.data, sortOrder]);

  // Generate chart data (mock data for now - can be replaced with real API data)
  // Note: Using fixed mock data to avoid React purity issues with Math.random()
  const revenueChartData = useMemo(() => {
    const days = 30;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      // Mock data: fixed pattern for demo (should be replaced with real API data)
      values.push(250000 + (i % 10) * 20000);
    }

    return { labels, values };
  }, []);

  const contentChartData = useMemo(() => {
    const days = 30;
    const labels: string[] = [];
    const values: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      // Mock data: fixed pattern for demo (should be replaced with real API data)
      values.push(20 + (i % 10) * 3);
    }

    return { labels, values };
  }, []);

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
        <DashboardFilters
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          isConnected={isConnected}
        />

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
          <ChartCard title="일별 매출 추이">
            <RevenueChart data={revenueChartData} />
          </ChartCard>
          <ChartCard title="콘텐츠 생성 현황">
            <ContentChart data={contentChartData} />
          </ChartCard>
        </div>

        {/* 최근 활동 */}
        <ActivitySection
          activities={recentActivities}
          isLoading={activityLogsQuery.isLoading}
          filters={activityFilters}
          onFiltersChange={setActivityFilters}
          limit={activityLimit}
          onLimitChange={setActivityLimit}
          startDate={activityStartDate}
          endDate={activityEndDate}
          onDateRangeChange={(start, end) => {
            setActivityStartDate(start);
            setActivityEndDate(end);
          }}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          pagination={
            activityLogsQuery.data?.pagination
              ? {
                  currentPage: activityLogsQuery.data.pagination.page,
                  totalPages: activityLogsQuery.data.pagination.totalPages,
                  total: activityLogsQuery.data.pagination.total,
                  limit: activityLogsQuery.data.pagination.limit,
                }
              : undefined
          }
          onPageChange={(page) => {
            setActivityFilters((prev) => ({ ...prev, page }));
          }}
        />
      </div>
    </>
  );
}
