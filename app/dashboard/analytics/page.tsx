'use client';

import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/stat-card';
import { FilterSection, FilterGroup } from '@/components/ui/filter-section';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, type AnalyticsOverview, type ProjectAnalytics, type ComparisonData } from '@/lib/api/analytics';
import { projectsApi, type Project } from '@/lib/api/projects';
import { useToastStore } from '@/lib/store/toastStore';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [projectFilter, setProjectFilter] = useState('');
  const [kioskFilter, setKioskFilter] = useState('');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonType, setComparisonType] = useState<'period' | 'project' | 'kiosk'>('period');
  const [period1Start, setPeriod1Start] = useState('');
  const [period1End, setPeriod1End] = useState('');
  const [period2Start, setPeriod2Start] = useState('');
  const [period2End, setPeriod2End] = useState('');
  const [selectedProject1, setSelectedProject1] = useState('');
  const [selectedProject2, setSelectedProject2] = useState('');
  const { showError } = useToastStore();

  const tabs = [
    { id: 'overview', label: '전체 개요' },
    { id: 'project', label: '프로젝트별' },
    { id: 'period', label: '기간별' },
    { id: 'comparison', label: '비교 분석' },
  ];

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load projects
      const projectList = await projectsApi.getAll();
      setProjects(projectList);

      // Load overview
      const overviewData = await analyticsApi.getOverview(projectFilter || undefined);
      setOverview(overviewData);

      // Load project analytics
      if (activeTab === 'project' || activeTab === 'comparison') {
        const projectAnalyticsData = await analyticsApi.getProjectAnalytics(
          projectFilter || undefined,
        );
        setProjectAnalytics(projectAnalyticsData);
      }
    } catch (error: any) {
      console.error('Failed to load analytics data:', error);
      showError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [projectFilter, activeTab, showError]);

  const loadComparison = useCallback(async () => {
    if (!period1Start || !period1End || !period2Start || !period2End) {
      return;
    }

    try {
      setIsLoading(true);
      const comparison = await analyticsApi.getComparison(
        comparisonType,
        period1Start,
        period1End,
        period2Start,
        period2End,
        selectedProject1 || undefined,
        selectedProject2 || undefined,
      );
      setComparisonData(comparison);
    } catch (error: any) {
      console.error('Failed to load comparison data:', error);
      showError('비교 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [
    comparisonType,
    period1Start,
    period1End,
    period2Start,
    period2End,
    selectedProject1,
    selectedProject2,
    showError,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'comparison' && period1Start && period1End && period2Start && period2End) {
      loadComparison();
    }
  }, [activeTab, period1Start, period1End, period2Start, period2End, loadComparison]);

  const handleRefresh = () => {
    loadData();
    if (activeTab === 'comparison') {
      loadComparison();
    }
  };

  // Initialize date defaults for comparison
  useEffect(() => {
    if (!period1Start) {
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      setPeriod1Start(lastMonth.toISOString().split('T')[0]);
      setPeriod1End(today.toISOString().split('T')[0]);
      setPeriod2Start(today.toISOString().split('T')[0]);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setPeriod2End(nextMonth.toISOString().split('T')[0]);
    }
  }, [period1Start]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="분석 & 리포트"
        description="시스템 성과 분석 및 상세 리포트"
        action={{
          label: '리포트 다운로드',
          icon: 'fas fa-download',
          onClick: () => console.log('Download report'),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 필터 섹션 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm border-b-3 transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-500 border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-blue-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <FilterSection>
            <FilterGroup label="기간:">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="today">오늘</option>
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
                <option value="quarter">이번 분기</option>
                <option value="year">올해</option>
                <option value="custom">사용자 정의</option>
              </select>
            </FilterGroup>
            <FilterGroup label="프로젝트:">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">전체 프로젝트</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </FilterGroup>
            <FilterGroup label="키오스크:">
              <select
                value={kioskFilter}
                onChange={(e) => setKioskFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">전체 키오스크</option>
                <option value="kiosk1">키오스크 #1</option>
                <option value="kiosk2">키오스크 #2</option>
                <option value="kiosk3">키오스크 #3</option>
              </select>
            </FilterGroup>
            <Button
              onClick={handleRefresh}
              className="bg-gray-500 hover:bg-gray-600 text-white"
              disabled={isLoading}
            >
              <i className="fas fa-sync mr-2"></i>새로고침
            </Button>
          </FilterSection>
        </div>

        {/* 전체 개요 탭 */}
        {activeTab === 'overview' && (
          <>
            {/* 핵심 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<i className="fas fa-video"></i>}
                value={overview ? overview.totalContent.toLocaleString() : '0'}
                label="총 콘텐츠 생성"
                change={
                  overview?.contentChange
                    ? {
                        value: `${overview.contentChange > 0 ? '+' : ''}${overview.contentChange.toFixed(1)}%`,
                        type: overview.contentChange > 0 ? 'positive' : 'negative',
                      }
                    : undefined
                }
                iconBg="bg-gradient-to-br from-purple-500 to-purple-700"
              />
              <StatCard
                icon={<i className="fas fa-won-sign"></i>}
                value={overview ? `₩${overview.totalRevenue.toLocaleString()}` : '₩0'}
                label="총 매출"
                change={
                  overview?.revenueChange
                    ? {
                        value: `${overview.revenueChange > 0 ? '+' : ''}${overview.revenueChange.toFixed(1)}%`,
                        type: overview.revenueChange > 0 ? 'positive' : 'negative',
                      }
                    : undefined
                }
                iconBg="bg-gradient-to-br from-pink-500 to-red-500"
              />
              <StatCard
                icon={<i className="fas fa-users"></i>}
                value={overview ? overview.activeUsers.toLocaleString() : '0'}
                label="활성 사용자"
                change={
                  overview?.usersChange
                    ? {
                        value: `${overview.usersChange > 0 ? '+' : ''}${overview.usersChange.toFixed(1)}%`,
                        type: overview.usersChange > 0 ? 'positive' : 'negative',
                      }
                    : undefined
                }
                iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <StatCard
                icon={<i className="fas fa-percentage"></i>}
                value={overview ? `${overview.conversionRate.toFixed(1)}%` : '0%'}
                label="전환율"
                change={
                  overview?.conversionChange
                    ? {
                        value: `${overview.conversionChange > 0 ? '+' : ''}${overview.conversionChange.toFixed(1)}%`,
                        type: overview.conversionChange > 0 ? 'positive' : 'negative',
                      }
                    : undefined
                }
                iconBg="bg-gradient-to-br from-green-400 to-teal-500"
              />
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">일별 매출 추이</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">콘텐츠 생성 현황</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">템플릿별 인기도</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">키오스크별 성과</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 프로젝트별 탭 */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트별 성과</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectAnalytics.map((analytics) => (
                  <div
                    key={analytics.projectId}
                    className={`bg-gray-50 border-2 rounded-lg p-4 transition-all ${
                      projectFilter === analytics.projectId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent hover:border-blue-300 cursor-pointer'
                    }`}
                    onClick={() => setProjectFilter(projectFilter === analytics.projectId ? '' : analytics.projectId)}
                  >
                    <h4 className="font-semibold text-gray-800 mb-3">{analytics.projectName}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">콘텐츠:</span>
                        <span className="font-semibold">{analytics.totalContent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">매출:</span>
                        <span className="font-semibold">₩{analytics.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">키오스크:</span>
                        <span className="font-semibold">{analytics.kioskCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content PC:</span>
                        <span className="font-semibold">{analytics.contentPCCount}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">스케줄:</span>
                          <span className="text-gray-700">
                            전체 {analytics.scheduleStats.total} | 활성 {analytics.scheduleStats.active} | 완료 {analytics.scheduleStats.completed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {projectAnalytics.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">프로젝트별 성과 비교</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">프로젝트</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-800">콘텐츠</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-800">매출</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-800">키오스크</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-800">스케줄</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectAnalytics.map((analytics) => (
                        <tr key={analytics.projectId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-800">{analytics.projectName}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{analytics.totalContent.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-700">₩{analytics.totalRevenue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{analytics.kioskCount}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{analytics.scheduleStats.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기간별 탭 */}
        {activeTab === 'period' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">분석 기간</h3>
              <div className="flex gap-2">
                {['일별', '주별', '월별', '년별'].map((period, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-gray-100 border-2 border-transparent rounded-lg text-sm font-semibold text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">기간별 매출 추이</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">기간별 사용자 증가</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>차트 영역 (Chart.js 통합 필요)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 비교 분석 탭 */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">비교 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <FilterGroup label="비교 대상:">
                  <select
                    value={comparisonType}
                    onChange={(e) => setComparisonType(e.target.value as 'period' | 'project' | 'kiosk')}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="period">기간 비교</option>
                    <option value="project">프로젝트 비교</option>
                    <option value="kiosk">키오스크 비교</option>
                  </select>
                </FilterGroup>
                {comparisonType === 'project' && (
                  <>
                    <FilterGroup label="프로젝트 1:">
                      <select
                        value={selectedProject1}
                        onChange={(e) => setSelectedProject1(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </FilterGroup>
                    <FilterGroup label="프로젝트 2:">
                      <select
                        value={selectedProject2}
                        onChange={(e) => setSelectedProject2(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </FilterGroup>
                  </>
                )}
                {comparisonType === 'period' && (
                  <>
                    <FilterGroup label="기준 기간 시작:">
                      <input
                        type="date"
                        value={period1Start}
                        onChange={(e) => setPeriod1Start(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </FilterGroup>
                    <FilterGroup label="기준 기간 종료:">
                      <input
                        type="date"
                        value={period1End}
                        onChange={(e) => setPeriod1End(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </FilterGroup>
                    <FilterGroup label="비교 기간 시작:">
                      <input
                        type="date"
                        value={period2Start}
                        onChange={(e) => setPeriod2Start(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </FilterGroup>
                    <FilterGroup label="비교 기간 종료:">
                      <input
                        type="date"
                        value={period2End}
                        onChange={(e) => setPeriod2End(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </FilterGroup>
                  </>
                )}
              </div>
              <div className="mt-4">
                <Button
                  onClick={loadComparison}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isLoading || (comparisonType === 'period' && (!period1Start || !period1End || !period2Start || !period2End))}
                >
                  <i className="fas fa-chart-line mr-2"></i>비교 분석 실행
                </Button>
              </div>
            </div>
            {comparisonData && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-5">비교 분석 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">기준 기간 ({comparisonData.period1.startDate} ~ {comparisonData.period1.endDate})</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">콘텐츠:</span>
                        <span className="font-semibold">{comparisonData.period1.metrics.totalContent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">매출:</span>
                        <span className="font-semibold">₩{comparisonData.period1.metrics.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">활성 사용자:</span>
                        <span className="font-semibold">{comparisonData.period1.metrics.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">전환율:</span>
                        <span className="font-semibold">{comparisonData.period1.metrics.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">비교 기간 ({comparisonData.period2.startDate} ~ {comparisonData.period2.endDate})</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">콘텐츠:</span>
                        <span className="font-semibold">{comparisonData.period2.metrics.totalContent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">매출:</span>
                        <span className="font-semibold">₩{comparisonData.period2.metrics.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">활성 사용자:</span>
                        <span className="font-semibold">{comparisonData.period2.metrics.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">전환율:</span>
                        <span className="font-semibold">{comparisonData.period2.metrics.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">변화율</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">콘텐츠</p>
                      <p className={`text-lg font-bold ${comparisonData.changes.contentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisonData.changes.contentChange >= 0 ? '+' : ''}{comparisonData.changes.contentChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">매출</p>
                      <p className={`text-lg font-bold ${comparisonData.changes.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisonData.changes.revenueChange >= 0 ? '+' : ''}{comparisonData.changes.revenueChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">활성 사용자</p>
                      <p className={`text-lg font-bold ${comparisonData.changes.usersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisonData.changes.usersChange >= 0 ? '+' : ''}{comparisonData.changes.usersChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">전환율</p>
                      <p className={`text-lg font-bold ${comparisonData.changes.conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisonData.changes.conversionChange >= 0 ? '+' : ''}{comparisonData.changes.conversionChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <LoadingModal isOpen={isLoading} message="데이터를 불러오는 중..." />
    </>
  );
}

