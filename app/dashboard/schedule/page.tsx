'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils/cn';
import { StatCard } from '@/components/ui/stat-card';

interface Schedule {
  id: string;
  projectId: string;
  contentId: string;
  authorName: string | null;
  wishMessage: string | null;
  templateAnimal: string | null;
  templateTheme: string | null;
  displayStart: string;
  displayEnd: string;
  purchaseDate: string;
  scheduleOrder: number;
  priority: number;
  status: 'scheduled' | 'playing' | 'completed' | 'cancelled';
  contentPcId: string | null;
  project?: {
    id: string;
    name: string;
  };
  content?: {
    id: string;
    userName: string;
    userMessage: string;
  };
}

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

interface ScheduleStatistics {
  total: number;
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
}

interface CalendarData {
  [date: string]: number;
}

export default function ScheduleManagementPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [contentPcs, setContentPcs] = useState<ContentPc[]>([]);
  const [statistics, setStatistics] = useState<ScheduleStatistics>({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  });

  // Filters
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [contentPcFilter, setContentPcFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  // Projects list for filter
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadProjects();
    loadSchedules();
    loadContentPcs();
    loadStatistics();
    loadCalendarData();
  }, [currentPage, projectFilter, contentPcFilter, statusFilter, dateFilter, searchTerm]);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, projectFilter]);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      const projectsData = response.data?.data || response.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (projectFilter) params.projectId = projectFilter;
      if (contentPcFilter) params.contentPcId = contentPcFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get('/schedules', { params });
      const responseData = response.data?.data || response.data;

      if (responseData.pagination) {
        setSchedules(responseData.data || []);
        setPagination(responseData.pagination);
      } else {
        setSchedules(Array.isArray(responseData) ? responseData : []);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      showError('스케줄을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentPcs = async () => {
    try {
      const params: any = {};
      if (projectFilter) params.projectId = projectFilter;

      const response = await apiClient.get('/schedules/content-pcs', { params });
      const responseData = response.data?.data || response.data;
      setContentPcs(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      console.error('Failed to load Content PCs:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const params: any = {};
      if (projectFilter) params.projectId = projectFilter;

      const response = await apiClient.get('/schedules/statistics', { params });
      const stats = response.data?.data || response.data;
      setStatistics(stats || { total: 0, active: 0, pending: 0, completed: 0, cancelled: 0 });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadCalendarData = async () => {
    if (!projectFilter) return;

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const response = await apiClient.get('/schedules/calendar', {
        params: {
          projectId: projectFilter,
          year,
          month,
        },
      });

      const data = response.data?.data || response.data || {};
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/schedules/${id}`);
      showSuccess('스케줄이 삭제되었습니다.');
      loadSchedules();
      loadStatistics();
    } catch (error: any) {
      showError(error.response?.data?.message || '스케줄 삭제에 실패했습니다.');
    }
  };

  const handleStopSchedule = async (id: string) => {
    if (!confirm('이 스케줄을 중지하시겠습니까?')) return;

    try {
      await apiClient.put(`/schedules/${id}`, { status: 'cancelled' });
      showSuccess('스케줄이 중지되었습니다.');
      loadSchedules();
      loadStatistics();
    } catch (error: any) {
      showError(error.response?.data?.message || '스케줄 중지에 실패했습니다.');
    }
  };

  const handleRestartSchedule = async (id: string) => {
    try {
      await apiClient.put(`/schedules/${id}`, { status: 'scheduled' });
      showSuccess('스케줄이 재실행되었습니다.');
      loadSchedules();
      loadStatistics();
    } catch (error: any) {
      showError(error.response?.data?.message || '스케줄 재실행에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
      playing: { label: '활성', className: 'bg-green-100 text-green-800' },
      completed: { label: '완료', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.scheduled;

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusInfo.className)}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return '높음';
    if (priority >= 2) return '보통';
    return '낮음';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ day: number; isCurrentMonth: boolean; date: Date }> = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getScheduleCountForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return calendarData[dateKey] || 0;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="스케줄 관리"
        description="콘텐츠 재생 스케줄 및 Content PC 관리"
        action={{
          label: '새 스케줄 생성',
          icon: 'fas fa-plus',
          onClick: () => {
            // TODO: Implement create schedule modal
            showError('스케줄 생성 기능은 곧 제공될 예정입니다.');
          },
        }}
      />
      <div className="p-8 min-h-screen bg-gray-50">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<i className="fas fa-calendar-alt"></i>}
            value={statistics.total.toLocaleString()}
            label="총 스케줄"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<i className="fas fa-play"></i>}
            value={statistics.active.toLocaleString()}
            label="활성 스케줄"
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={<i className="fas fa-clock"></i>}
            value={statistics.pending.toLocaleString()}
            label="대기 중"
            iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <StatCard
            icon={<i className="fas fa-desktop"></i>}
            value={contentPcs.length.toString()}
            label="Content PC"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트:
              </label>
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 프로젝트</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content PC:
              </label>
              <select
                value={contentPcFilter}
                onChange={(e) => {
                  setContentPcFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 Content PC</option>
                {contentPcs.map((pc) => (
                  <option key={pc.id} value={pc.id}>
                    {pc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="scheduled">대기</option>
                <option value="playing">활성</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                날짜:
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색:
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="콘텐츠 ID 또는 제목 검색..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={loadSchedules}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  <i className="fas fa-search"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Calendar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">스케줄 캘린더</h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigateMonth(-1)}
                className="bg-gray-400 hover:bg-gray-500 text-white"
                size="sm"
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              <span className="text-lg font-medium text-gray-700">
                {currentMonth.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                })}
              </span>
              <Button
                onClick={() => navigateMonth(1)}
                className="bg-gray-400 hover:bg-gray-500 text-white"
                size="sm"
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div
                key={day}
                className="text-center font-medium text-gray-600 py-2 text-sm"
              >
                {day}
              </div>
            ))}
            {getCalendarDays().map((dayInfo, index) => {
              const scheduleCount = getScheduleCountForDate(dayInfo.date);
              const isCurrentDay = isToday(dayInfo.date);

              return (
                <div
                  key={index}
                  className={cn(
                    'aspect-square p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors',
                    !dayInfo.isCurrentMonth && 'text-gray-400 bg-gray-50',
                    isCurrentDay && 'bg-blue-100 border-blue-500 font-bold',
                    scheduleCount > 0 && 'bg-purple-50 border-purple-300',
                  )}
                  onClick={() => {
                    if (dayInfo.isCurrentMonth) {
                      setDateFilter(
                        dayInfo.date.toISOString().split('T')[0],
                      );
                    }
                  }}
                >
                  <div className="text-sm">{dayInfo.day}</div>
                  {scheduleCount > 0 && (
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      {scheduleCount}개
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">스케줄 목록</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">스케줄이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border-l-4 border-blue-500 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {schedule.authorName || schedule.content?.userName || 'Unknown'} -{' '}
                        {schedule.templateAnimal || '꿈조각'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Content PC:{' '}
                        {schedule.contentPcId
                          ? contentPcs.find((pc) => pc.id === schedule.contentPcId)?.name ||
                            '할당됨'
                          : '미할당'}
                      </p>
                    </div>
                    <div>{getStatusBadge(schedule.status)}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">시작 시간:</span>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDateTime(schedule.displayStart)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">종료 시간:</span>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDateTime(schedule.displayEnd)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">우선순위:</span>
                      <p className="text-sm font-medium text-gray-800">
                        {getPriorityText(schedule.priority)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">순서:</span>
                      <p className="text-sm font-medium text-gray-800">
                        {schedule.scheduleOrder}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        // TODO: Implement view details modal
                        showError('상세보기 기능은 곧 제공될 예정입니다.');
                      }}
                    >
                      <i className="fas fa-eye mr-1"></i>
                      상세보기
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => {
                        // TODO: Implement edit modal
                        showError('수정 기능은 곧 제공될 예정입니다.');
                      }}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      수정
                    </Button>
                    {schedule.status === 'playing' || schedule.status === 'scheduled' ? (
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleStopSchedule(schedule.id)}
                      >
                        <i className="fas fa-stop mr-1"></i>
                        중지
                      </Button>
                    ) : schedule.status === 'completed' ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleRestartSchedule(schedule.id)}
                        >
                          <i className="fas fa-redo mr-1"></i>
                          재실행
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <i className="fas fa-trash mr-1"></i>
                          삭제
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Content PC Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Content PC 관리</h3>
          {contentPcs.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Content PC가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentPcs.map((pc) => (
                <div
                  key={pc.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
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
                      <p className="text-sm font-medium text-gray-800">
                        {pc.ipAddress || 'N/A'}
                      </p>
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
                          ? schedules.find((s) => s.id === pc.currentScheduleId)?.authorName ||
                            '없음'
                          : pc.lastConnectedAt
                            ? formatDateTime(pc.lastConnectedAt)
                            : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">대기 스케줄:</span>
                      <p className="text-sm font-medium text-gray-800">
                        {pc.waitingScheduleCount}개
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => {
                        // TODO: Implement monitoring modal
                        showError('모니터링 기능은 곧 제공될 예정입니다.');
                      }}
                    >
                      <i className="fas fa-eye mr-1"></i>
                      모니터링
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                      onClick={() => {
                        // TODO: Implement settings modal
                        showError('설정 기능은 곧 제공될 예정입니다.');
                      }}
                    >
                      <i className="fas fa-cog mr-1"></i>
                      설정
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={() => {
                        // TODO: Implement restart
                        showError('재시작 기능은 곧 제공될 예정입니다.');
                      }}
                    >
                      <i className="fas fa-sync mr-1"></i>
                      재시작
                    </Button>
                    {pc.status === 'offline' && (
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                          // TODO: Implement repair request
                          showError('수리 요청 기능은 곧 제공될 예정입니다.');
                        }}
                      >
                        <i className="fas fa-tools mr-1"></i>
                        수리 요청
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

