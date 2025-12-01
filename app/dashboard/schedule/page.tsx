'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils/cn';
import { StatCard } from '@/components/ui/stat-card';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { CreateScheduleModal } from '@/components/schedules/CreateScheduleModal';
import { ScheduleDetailModal } from '@/components/schedules/ScheduleDetailModal';
import { EditScheduleModal } from '@/components/schedules/EditScheduleModal';
import { Calendar, CalendarDateData } from '@/components/ui/calendar';
import { ScheduleItem } from '@/components/schedules/ScheduleItem';
import { ContentPCItem } from '@/components/schedules/ContentPCItem';
import { useRoutePermission } from '@/lib/hooks/use-route-permission';
import { PermissionGate } from '@/components/auth/permission-gate';
import { SchedulePageSkeleton } from '@/components/skeletons/SchedulePageSkeleton';

interface Schedule {
  id: string;
  projectId: string;
  contentId: string;
  title: string | null;
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
  playCount?: number; // Current play count
  maxPlayCount?: number; // Maximum play count
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Protect route with permission check
  useRoutePermission('schedule:read', '/dashboard');

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
  
  // Initialize filters from URL query parameters
  const [projectFilter, setProjectFilter] = useState<string>(searchParams.get('project') || '');
  const [contentPcFilter, setContentPcFilter] = useState<string>(searchParams.get('contentPc') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState<string>(searchParams.get('date') || '');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  });

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  // Projects list for filter
  const [projects, setProjects] = useState<Array<{ id: string; name: string; location?: string }>>([]);
  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const [contentPcOptions, setContentPcOptions] = useState<SearchableSelectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const { showSuccess, showError } = useToastStore();

  // Update URL query parameters
  const updateURL = useCallback((updates: {
    project?: string;
    contentPc?: string;
    status?: string;
    date?: string;
    search?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.project !== undefined) {
      if (updates.project) {
        params.set('project', updates.project);
      } else {
        params.delete('project');
      }
    }
    
    if (updates.contentPc !== undefined) {
      if (updates.contentPc) {
        params.set('contentPc', updates.contentPc);
      } else {
        params.delete('contentPc');
      }
    }
    
    if (updates.status !== undefined) {
      if (updates.status) {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }
    
    if (updates.date !== undefined) {
      if (updates.date) {
        params.set('date', updates.date);
      } else {
        params.delete('date');
      }
    }
    
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', updates.page.toString());
      } else {
        params.delete('page');
      }
    }
    
    router.push(`/dashboard/schedule?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await apiClient.get('/projects', {
        params: {
          page: 1,
          limit: 20,
          fields: 'id,name,location',
        },
      });
      const projectsData = response.data?.data?.data ||response.data?.data || response.data || [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];
      
      // Convert to SearchableSelectOption format
      const options: SearchableSelectOption[] = [
        { id: 'all', label: '전체 프로젝트', value: '' },
        ...projectsList.map((project: any) => ({
          id: project.id,
          label: `${project.name}${project.location ? ` (${project.location})` : ''}`,
          value: project.id,
        })),
      ];

      setProjectOptions(options);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjectOptions([{ id: 'all', label: '전체 프로젝트', value: '' }]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [showError]);

  const loadSchedules = useCallback(async () => {
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
  }, [currentPage, projectFilter, contentPcFilter, statusFilter, dateFilter, searchTerm, showError]);

  const loadContentPcs = useCallback(async () => {
    try {
      const params: any = {};
      if (projectFilter) params.projectId = projectFilter;

      const response = await apiClient.get('/schedules/content-pcs', { params });
      const responseData = response.data?.data || response.data;
      const pcsList = Array.isArray(responseData) ? responseData : [];
      setContentPcs(pcsList);
      
      // Convert to SearchableSelectOption format
      const options: SearchableSelectOption[] = [
        { id: 'all', label: '전체 Content PC', value: '' },
        ...pcsList.map((pc) => ({
          id: pc.id,
          label: pc.name,
          value: pc.id,
        })),
      ];
      setContentPcOptions(options);
    } catch (error) {
      console.error('Failed to load Content PCs:', error);
    }
  }, [projectFilter]);

  const loadStatistics = useCallback(async () => {
    try {
      const params: any = {};
      if (projectFilter) params.projectId = projectFilter;

      const response = await apiClient.get('/schedules/statistics', { params });
      const stats = response.data?.data || response.data;
      setStatistics(stats || { total: 0, active: 0, pending: 0, completed: 0, cancelled: 0 });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, [projectFilter]);

  const loadCalendarData = useCallback(async () => {
    if (!projectFilter) {
      setCalendarData({});
      return;
    }

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
      setCalendarData({});
    }
  }, [currentMonth, projectFilter]);

  useEffect(() => {
    loadProjects();
    loadSchedules();
    loadContentPcs();
    loadStatistics();
    loadCalendarData();
  }, [loadProjects, loadSchedules, loadContentPcs, loadStatistics, loadCalendarData]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('이 스케줄을 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/schedules/${id}`);
      showSuccess('스케줄이 삭제되었습니다.');
      loadSchedules();
      loadStatistics();
      loadCalendarData(); // Refresh calendar view
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
      loadCalendarData(); // Refresh calendar view
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
      loadCalendarData(); // Refresh calendar view
    } catch (error: any) {
      showError(error.response?.data?.message || '스케줄 재실행에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
      playing: { label: '활성', className: 'bg-green-100 text-green-800' },
      completed: { label: '완료', className: 'bg-green-50 text-green-700' },
      cancelled: { label: '취소', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.scheduled;

    return (
      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusInfo.className)}>
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;

    // return date.toLocaleString('ko-KR', {
    //   year: 'numeric',
    //   month: '2-digit',
    //   day: '2-digit',
    //   hour: '2-digit',
    //   minute: '2-digit',
    // });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleCalendarDateClick = (date: string) => {
    setDateFilter(date);
    setCurrentPage(1);
    updateURL({ date, page: 1 });
  };

  const handleCalendarMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  // Show skeleton while loading initial data
  if (isLoading && schedules.length === 0) {
    return <SchedulePageSkeleton />;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="스케줄 관리"
        description="콘텐츠 재생 스케줄 및 Content PC 관리"
        action={
          <PermissionGate permission="schedule:create">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <i className="fas fa-plus mr-2"></i>
              새 스케줄 생성
            </Button>
          </PermissionGate>
        }
      />
      <div className="p-8 min-h-screen bg-gray-50">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<i className="fas fa-calendar-alt"></i>}
            value={statistics.total.toLocaleString()}
            label="총 스케줄"
            iconBg="bg-gradient-to-br from-purple-500 to-blue-500"
          />
          <StatCard
            icon={<i className="fas fa-play"></i>}
            value={statistics.active.toLocaleString()}
            label="활성 스케줄"
            iconBg="bg-gradient-to-br from-purple-500 to-blue-500"
          />
          <StatCard
            icon={<i className="fas fa-clock"></i>}
            value={statistics.pending.toLocaleString()}
            label="대기 중"
            iconBg="bg-gradient-to-br from-purple-500 to-blue-500"
          />
          <StatCard
            icon={<i className="fas fa-desktop"></i>}
            value={contentPcs.length.toString()}
            label="Content PC"
            iconBg="bg-gradient-to-br from-purple-500 to-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트:
              </label>
              <SearchableSelect
                options={projectOptions}
                value={projectFilter}
                onChange={(value) => {
                  setProjectFilter(value);
                  setCurrentPage(1);
                  updateURL({ project: value, page: 1 });
                }}
                placeholder="전체 프로젝트"
                searchPlaceholder="프로젝트 검색..."
                isLoading={isLoadingProjects}
                emptyMessage="프로젝트가 없습니다."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content PC:
              </label>
              <SearchableSelect
                options={contentPcOptions}
                value={contentPcFilter}
                onChange={(value) => {
                  setContentPcFilter(value);
                  setCurrentPage(1);
                  updateURL({ contentPc: value, page: 1 });
                }}
                placeholder="전체 Content PC"
                searchPlaceholder="Content PC 검색..."
                emptyMessage="Content PC가 없습니다."
                disabled={!projectFilter && contentPcs.length === 0}
              />
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
                  updateURL({ date: e.target.value, page: 1 });
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
        <div className="mb-6">
          <Calendar
            currentMonth={currentMonth}
            selectedDate={dateFilter}
            dateData={calendarData as CalendarDateData}
            onDateClick={handleCalendarDateClick}
            onMonthChange={handleCalendarMonthChange}
            headerTitle="스케줄 캘린더"
            locale="ko-KR"
          />
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
                <ScheduleItem
                  key={schedule.id}
                  schedule={schedule}
                  contentPcs={contentPcs}
                  onViewDetails={(id) => {
                    setSelectedScheduleId(id);
                  }}
                  onEdit={(id) => {
                    setEditingScheduleId(id);
                  }}
                  onStop={handleStopSchedule}
                  onRestart={handleRestartSchedule}
                  onDelete={handleDeleteSchedule}
                  formatDateTime={formatDateTime}
                  getStatusBadge={getStatusBadge}
                  getPriorityText={getPriorityText}
                />
              ))}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  updateURL({ page });
                }}
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
                <ContentPCItem
                  key={pc.id}
                  pc={pc}
                  schedules={schedules.map((s) => ({
                    id: s.id,
                    authorName: s.authorName,
                  }))}
                  onMonitoring={(id) => {
                    // TODO: Implement monitoring modal
                    showError('모니터링 기능은 곧 제공될 예정입니다.');
                  }}
                  onSettings={(id) => {
                    // TODO: Implement settings modal
                    showError('설정 기능은 곧 제공될 예정입니다.');
                  }}
                  onRestart={(id) => {
                    // TODO: Implement restart
                    showError('재시작 기능은 곧 제공될 예정입니다.');
                  }}
                  onRepair={(id) => {
                    // TODO: Implement repair request
                    showError('수리 요청 기능은 곧 제공될 예정입니다.');
                  }}
                  formatDateTime={formatDateTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadSchedules();
          loadStatistics();
          loadCalendarData(); // Refresh calendar view
        }}
      />

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        open={selectedScheduleId !== null}
        scheduleId={selectedScheduleId}
        onClose={() => setSelectedScheduleId(null)}
        onSave={(id) => {
          // Open edit modal when save is clicked
          setSelectedScheduleId(null);
          setEditingScheduleId(id);
        }}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        open={editingScheduleId !== null}
        scheduleId={editingScheduleId}
        onClose={() => setEditingScheduleId(null)}
        onSuccess={() => {
          loadSchedules();
          loadStatistics();
          loadCalendarData();
          setEditingScheduleId(null);
        }}
      />
    </>
  );
}

