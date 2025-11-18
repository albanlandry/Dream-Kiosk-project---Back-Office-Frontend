'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FilterSection, FilterGroup, SearchGroup } from '@/components/ui/filter-section';
import { Button } from '@/components/ui/button';
import { proposalsApi, Proposal, ProposalStats } from '@/lib/api/proposals';
import { useToastStore } from '@/lib/store/toastStore';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils/cn';
import { ViewProposalModal } from '@/components/proposals/ViewProposalModal';
import { EditProposalModal } from '@/components/proposals/EditProposalModal';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function ProposalsManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize filters from URL query parameters
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [durationFilter, setDurationFilter] = useState(searchParams.get('duration') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const { showSuccess, showError } = useToastStore();

  // Update URL query parameters
  const updateURL = useCallback((updates: {
    project?: string;
    duration?: string;
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
    
    if (updates.duration !== undefined) {
      if (updates.duration) {
        params.set('duration', updates.duration);
      } else {
        params.delete('duration');
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
    
    router.push(`/dashboard/propose?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [proposalsData, statsData] = await Promise.all([
        proposalsApi.getAll(),
        proposalsApi.getStats(),
      ]);
      setProposals(proposalsData);
      setStats(statsData);

      // Extract unique projects from proposals
      const uniqueProjects = Array.from(
        new Map(
          proposalsData
            .filter((p) => p.project)
            .map((p) => [p.project!.id, p.project!])
        ).values()
      );
      setProjects(uniqueProjects);
    } catch (error: unknown) {
      showError('프로포즈 데이터를 불러오는데 실패했습니다.');
      console.error('Error loading proposals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync URL params to state on mount
  useEffect(() => {
    const project = searchParams.get('project') || '';
    const duration = searchParams.get('duration') || '';
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page')) || 1;
    
    setProjectFilter(project);
    setDurationFilter(duration);
    setStatusFilter(status);
    setDateFilter(date);
    setSearchQuery(search);
    setCurrentPage(page);
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 프로포즈를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await proposalsApi.delete(id);
      showSuccess('프로포즈가 삭제되었습니다.');
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showError(err.response?.data?.message || '프로포즈 삭제에 실패했습니다.');
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((proposal) => {
    // Project filter
    if (projectFilter && proposal.projectId !== projectFilter) {
      return false;
    }

    // Duration filter
    if (durationFilter && proposal.duration.toString() !== durationFilter) {
      return false;
    }

    // Status filter
    if (statusFilter) {
      const now = new Date();
      const displayEnd = new Date(proposal.displayEnd);
      if (statusFilter === 'active' && (proposal.status !== 'enabled' || displayEnd < now)) {
        return false;
      }
      if (statusFilter === 'expired' && displayEnd >= now) {
        return false;
      }
      if (statusFilter === 'disabled' && proposal.status !== 'disabled') {
        return false;
      }
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const displayStart = new Date(proposal.displayStart);
      const displayEnd = new Date(proposal.displayEnd);
      if (displayStart > filterDate || displayEnd < filterDate) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = proposal.name.toLowerCase().includes(query);
      const matchesMessage = proposal.message.toLowerCase().includes(query);
      if (!matchesName && !matchesMessage) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProposals.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProposals = filteredProposals.slice(startIndex, endIndex);
  
  // Sync currentPage if it's out of range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      updateURL({ page: totalPages });
    } else if (currentPage < 1) {
      setCurrentPage(1);
      updateURL({ page: 1 });
    }
  }, [currentPage, totalPages, updateURL]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  // Handle filter changes
  const handleProjectFilterChange = (value: string) => {
    setProjectFilter(value);
    setCurrentPage(1);
    updateURL({ project: value, page: 1 });
  };

  const handleDurationFilterChange = (value: string) => {
    setDurationFilter(value);
    setCurrentPage(1);
    updateURL({ duration: value, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    updateURL({ status: value, page: 1 });
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
    updateURL({ date: value, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateURL({ search: value, page: 1 });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurationLabel = (duration: number) => {
    switch (duration) {
      case 1:
        return '1개월';
      case 3:
        return '3개월';
      case 6:
        return '6개월';
      case 12:
        return '12개월';
      default:
        return `${duration}개월`;
    }
  };

  const getStatusBadge = (proposal: Proposal) => {
    const now = new Date();
    const displayEnd = new Date(proposal.displayEnd);
    const isExpired = displayEnd < now;

    if (isExpired) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          만료됨
        </span>
      );
    }
    if (proposal.status === 'disabled') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          비활성화
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        활성
      </span>
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="프로포즈 관리"
        description="전시회 제안 및 프로포즈 콘텐츠 관리"
        action={{
          label: '새 프로포즈 생성',
          icon: 'fas fa-plus',
          onClick: () => {
            // TODO: Open create proposal modal
            showError('프로포즈 생성 기능은 곧 추가될 예정입니다.');
          },
        }}
      />
      <div className="p-8 min-h-screen bg-gray-50">
        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<i className="fas fa-heart"></i>}
              iconBg="bg-blue-500"
              value={stats.totalProposals.toString()}
              label="총 프로포즈 콘텐츠"
              change={
                stats.totalProposalsChange !== undefined
                  ? {
                      value: `${stats.totalProposalsChange > 0 ? '+' : ''}${stats.totalProposalsChange}%`,
                      type: stats.totalProposalsChange > 0 ? 'positive' : stats.totalProposalsChange < 0 ? 'negative' : 'neutral',
                    }
                  : undefined
              }
            />
            <StatCard
              icon={<i className="fas fa-check"></i>}
              iconBg="bg-green-500"
              value={stats.activeProposals.toString()}
              label="활성 프로포즈"
              change={
                stats.activeProposalsChange !== undefined
                  ? {
                      value: `${stats.activeProposalsChange > 0 ? '+' : ''}${stats.activeProposalsChange}%`,
                      type: stats.activeProposalsChange > 0 ? 'positive' : stats.activeProposalsChange < 0 ? 'negative' : 'neutral',
                    }
                  : undefined
              }
            />
            <StatCard
              icon={<i className="fas fa-clock"></i>}
              iconBg="bg-orange-500"
              value={stats.expiredProposals.toString()}
              label="만료된 프로포즈"
              change={
                stats.expiredProposalsChange !== undefined
                  ? {
                      value: `${stats.expiredProposalsChange > 0 ? '+' : ''}${stats.expiredProposalsChange}%`,
                      type: 'neutral',
                    }
                  : undefined
              }
            />
            <StatCard
              icon={<i className="fas fa-won-sign"></i>}
              iconBg="bg-red-500"
              value={`₩${stats.totalRevenue.toLocaleString()}`}
              label="프로포즈 총 매출"
              change={
                stats.totalRevenueChange !== undefined
                  ? {
                      value: `${stats.totalRevenueChange > 0 ? '+' : ''}${stats.totalRevenueChange}%`,
                      type: stats.totalRevenueChange > 0 ? 'positive' : stats.totalRevenueChange < 0 ? 'negative' : 'neutral',
                    }
                  : undefined
              }
            />
          </div>
        )}

        {/* 필터 및 검색 */}
        <FilterSection>
          <FilterGroup label="프로젝트:">
            <select
              value={projectFilter}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label="기간:">
            <select
              value={durationFilter}
              onChange={(e) => handleDurationFilterChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="1">1개월</option>
              <option value="3">3개월</option>
              <option value="6">6개월</option>
              <option value="12">12개월</option>
            </select>
          </FilterGroup>
          <FilterGroup label="상태:">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="expired">만료됨</option>
              <option value="disabled">비활성화</option>
            </select>
          </FilterGroup>
          <FilterGroup label="날짜:">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </FilterGroup>
          <SearchGroup
            placeholder="이름 또는 메시지 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={() => {
              // Search is handled by filter
            }}
          />
        </FilterSection>

        {/* 프로포즈 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg">프로포즈가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {paginatedProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-xl p-6 shadow-sm grid grid-cols-[200px_1fr_auto] gap-6"
              >
                {/* 이미지 */}
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {proposal.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${proposal.image}`}
                      alt={proposal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <i className={cn(
                    "fas fa-image text-4xl text-gray-400",
                    proposal.image && "hidden"
                  )}></i>
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">{proposal.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{proposal.message}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>프로젝트:</strong>{' '}
                      {proposal.project?.name || 'N/A'}
                    </p>
                    <p>
                      <strong>기간:</strong> {getDurationLabel(proposal.duration)}
                    </p>
                    <p>
                      <strong>표시 시작:</strong> {formatDate(proposal.displayStart)}
                    </p>
                    <p>
                      <strong>표시 종료:</strong> {formatDate(proposal.displayEnd)}
                    </p>
                    <p>
                      <strong>생성일:</strong> {formatDate(proposal.createdAt)}
                    </p>
                    <p>
                      <strong>상태:</strong> {getStatusBadge(proposal)}
                    </p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {/* 미리보기 - 보라색-파란색 그라데이션 */}
                  <Button
                    onClick={() => setViewingProposal(proposal)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm rounded-lg"
                  >
                    <i className="fas fa-eye mr-2"></i>미리보기
                  </Button>

                  {/* 사진 다운로드 - 어두운 회색 */}
                  {proposal.image && (
                    <Button
                      onClick={() => {
                        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${proposal.image}`;
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `${proposal.name}_image.jpg`;
                        link.click();
                      }}
                      className="bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg"
                    >
                      <i className="fas fa-download mr-2"></i>사진 다운로드
                    </Button>
                  )}

                  {/* 다운로드 QR 보기 - 청록색 */}
                  <Button
                    onClick={() => {
                      // TODO: Implement QR code view for proposal
                      showError('QR 코드 기능은 곧 추가될 예정입니다.');
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg"
                  >
                    <i className="fas fa-qrcode mr-2"></i>다운로드 QR 보기
                  </Button>

                  {/* 수정 - 노란색 배경, 검은색 텍스트 */}
                  <Button
                    onClick={() => setEditingProposal(proposal)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black text-sm rounded-lg font-semibold"
                  >
                    <i className="fas fa-edit mr-2"></i>수정
                  </Button>

                  {/* 삭제 - 빨간색 */}
                  <Button
                    onClick={() => handleDelete(proposal.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
                  >
                    <i className="fas fa-trash mr-2"></i>삭제
                  </Button>
                </div>
              </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {filteredProposals.length > 0 && (
              <div className="flex justify-center mt-8 mb-4">
                <Pagination
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 미리보기 모달 */}
      {viewingProposal && (
        <ViewProposalModal
          proposal={viewingProposal}
          onClose={() => setViewingProposal(null)}
        />
      )}

      {/* 편집 모달 */}
      {editingProposal && (
        <EditProposalModal
          proposal={editingProposal}
          onClose={() => setEditingProposal(null)}
          onSuccess={() => {
            loadData();
            setEditingProposal(null);
          }}
        />
      )}
    </>
  );
}

