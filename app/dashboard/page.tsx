'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { useStatistics } from '@/lib/hooks/useStatistics';
import { useDashboardWebSocket } from '@/lib/hooks/useDashboardWebSocket';
import { ProjectSelect } from '@/components/projects/ProjectSelect';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { useEffect, useState, useMemo } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function DashboardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [recentActivities, setRecentActivities] = useState([
    {
      icon: 'fas fa-video',
      title: '새로운 콘텐츠 생성',
      description: '키오스크 #3에서 "용" 템플릿으로 콘텐츠 생성',
      time: '2분 전',
    },
    {
      icon: 'fas fa-credit-card',
      title: '결제 완료',
      description: '₩15,000 - 7일 노출 상품',
      time: '5분 전',
    },
    {
      icon: 'fas fa-exclamation-triangle',
      title: '키오스크 오류',
      description: '키오스크 #7에서 카드 리더기 오류 발생',
      time: '10분 전',
    },
  ]);

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
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">최근 활동</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <i className={activity.icon}></i>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">{activity.title}</p>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
