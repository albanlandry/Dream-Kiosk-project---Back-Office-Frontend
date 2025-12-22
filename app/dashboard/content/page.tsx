'use client';

import { Header } from '@/components/layout/Header';
import { FilterSection, FilterGroup, SearchGroup } from '@/components/ui/filter-section';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { UploadContentModal } from '@/components/content/UploadContentModal';
import { CreateContentModal } from '@/components/content/CreateContentModal';
import { ContentPreviewModal, ContentItem } from '@/components/content/ContentPreviewModal';
import { ContentEditModal } from '@/components/content/ContentEditModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ContentItemCard } from '@/components/content/ContentItemCard';
import { useToastStore } from '@/lib/store/toastStore';
import { useState, useMemo, useCallback } from 'react';

export default function ContentManagementPage() {
  const [templateFilter, setTemplateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [editContent, setEditContent] = useState<ContentItem | null>(null);
  const [deleteContent, setDeleteContent] = useState<ContentItem | null>(null);
  const { showSuccess, showError } = useToastStore();

  const [allContentItems, setAllContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: '용의 꿈 - 김철수',
      template: '용 (Dragon)',
      author: '김철수',
      wish: '가족의 건강과 행복을 기원합니다.',
      createdAt: '2024-12-22 14:30',
      displayPeriod: '7일 (2024-12-29까지)',
      status: 'active',
    },
    {
      id: '2',
      title: '호랑이의 꿈 - 이영희',
      template: '호랑이 (Tiger)',
      author: '이영희',
      wish: '새로운 시작과 성공을 기원합니다.',
      createdAt: '2024-12-22 13:15',
      displayPeriod: '30일 (2025-01-21까지)',
      status: 'active',
    },
    {
      id: '3',
      title: '봉황의 꿈 - 박민수',
      template: '봉황 (Phoenix)',
      author: '박민수',
      wish: '사랑하는 사람과의 영원한 사랑을 기원합니다.',
      createdAt: '2024-12-21 16:45',
      displayPeriod: '1일 (만료됨)',
      status: 'expired',
    },
    {
      id: '4',
      title: '거북이의 꿈 - 최지영',
      template: '거북이 (Turtle)',
      author: '최지영',
      wish: '장수와 건강을 기원합니다.',
      createdAt: '2024-12-20 10:20',
      displayPeriod: '15일 (2025-01-04까지)',
      status: 'active',
    },
    {
      id: '5',
      title: '용의 꿈 - 정수진',
      template: '용 (Dragon)',
      author: '정수진',
      wish: '사업 번창과 재물을 기원합니다.',
      createdAt: '2024-12-19 16:00',
      displayPeriod: '60일 (2025-02-17까지)',
      status: 'active',
    },
    {
      id: '6',
      title: '호랑이의 꿈 - 강민호',
      template: '호랑이 (Tiger)',
      author: '강민호',
      wish: '용기와 힘을 기원합니다.',
      createdAt: '2024-12-18 11:30',
      displayPeriod: '90일 (2025-03-18까지)',
      status: 'active',
    },
    {
      id: '7',
      title: '봉황의 꿈 - 윤서연',
      template: '봉황 (Phoenix)',
      author: '윤서연',
      wish: '새로운 시작과 변화를 기원합니다.',
      createdAt: '2024-12-17 14:15',
      displayPeriod: '45일 (2025-01-31까지)',
      status: 'active',
    },
    {
      id: '8',
      title: '거북이의 꿈 - 송태현',
      template: '거북이 (Turtle)',
      author: '송태현',
      wish: '안정과 평화를 기원합니다.',
      createdAt: '2024-12-16 09:45',
      displayPeriod: '30일 (2025-01-15까지)',
      status: 'active',
    },
  ]);

  // 필터링된 콘텐츠
  const filteredItems = useMemo(() => {
    return allContentItems.filter((item) => {
      const matchesTemplate = !templateFilter || item.template.toLowerCase().includes(templateFilter.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.includes(searchQuery);
      
      return matchesTemplate && matchesStatus && matchesSearch;
    });
  }, [templateFilter, statusFilter, searchQuery]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const contentItems = filteredItems.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 항목 수 변경 핸들러
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // 항목 수 변경 시 첫 페이지로 리셋
  };

  // 미리보기 핸들러
  const handlePreview = useCallback((item: ContentItem) => {
    setPreviewContent(item);
  }, []);

  // 다운로드 핸들러
  const handleDownload = useCallback(async (item: ContentItem) => {
    try {
      // TODO: 실제 API 엔드포인트로 대체
      // const response = await apiClient.get(`/content/${item.id}/download`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `${item.title}.mp4`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      // window.URL.revokeObjectURL(url);

      // 임시 구현: 다운로드 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));
      showSuccess(`${item.title} 다운로드가 시작되었습니다.`);
    } catch (error) {
      console.error('Download failed:', error);
      showError('다운로드에 실패했습니다.');
    }
  }, [showSuccess, showError]);

  // 수정 핸들러
  const handleEdit = useCallback((item: ContentItem) => {
    setEditContent(item);
  }, []);

  // 수정 완료 핸들러
  const handleEditSuccess = useCallback((updatedContent: ContentItem) => {
    setAllContentItems((prev) =>
      prev.map((item) => (item.id === updatedContent.id ? updatedContent : item))
    );
    showSuccess('콘텐츠가 성공적으로 수정되었습니다.');
    setEditContent(null);
  }, [showSuccess]);

  // 삭제 핸들러
  const handleDelete = useCallback((item: ContentItem) => {
    setDeleteContent(item);
  }, []);

  // 삭제 확인 핸들러
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteContent) return;

    try {
      // TODO: 실제 API 호출로 대체
      // await apiClient.delete(`/content/${deleteContent.id}`);

      // 임시 구현: 삭제 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllContentItems((prev) => prev.filter((item) => item.id !== deleteContent.id));
      showSuccess(`${deleteContent.title}이(가) 삭제되었습니다.`);
      setDeleteContent(null);
    } catch (error) {
      console.error('Delete failed:', error);
      showError('삭제에 실패했습니다.');
    }
  }, [deleteContent, showSuccess, showError]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="콘텐츠 관리"
        description="생성된 콘텐츠 및 템플릿 관리"
        action={{
          label: '새 콘텐츠 생성',
          icon: 'fas fa-plus',
          onClick: () => setShowCreateModal(true),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 액션 버튼 영역 */}
        <div className="flex justify-end gap-3 mb-6">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white"
          >
            <i className="fas fa-upload mr-2"></i>
            리소스 업로드
          </Button>
        </div>

        {/* 필터 및 검색 */}
        <FilterSection>
          <FilterGroup label="템플릿:">
            <select
              value={templateFilter}
              onChange={(e) => {
                setTemplateFilter(e.target.value);
                setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="dragon">용</option>
              <option value="tiger">호랑이</option>
              <option value="phoenix">봉황</option>
              <option value="turtle">거북이</option>
            </select>
          </FilterGroup>
          <FilterGroup label="상태:">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="expired">만료</option>
              <option value="pending">대기중</option>
            </select>
          </FilterGroup>
          <FilterGroup label="날짜:">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </FilterGroup>
          <FilterGroup label="페이지당 항목:">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
              <option value={100}>100개</option>
            </select>
          </FilterGroup>
          <SearchGroup
            placeholder="작성자명 또는 ID 검색..."
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1); // 검색어 변경 시 첫 페이지로 리셋
            }}
            onSearch={() => {
              console.log('Search:', searchQuery);
              setCurrentPage(1); // 검색 실행 시 첫 페이지로 리셋
            }}
          />
        </FilterSection>

        {/* 콘텐츠 목록 */}
        <div className="space-y-6">
          {contentItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 콘텐츠 생성 모달 */}
      <CreateContentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // 콘텐츠 목록 새로고침 (필요시 구현)
          console.log('Content created successfully');
        }}
      />

      {/* 리소스 업로드 모달 (이미지/비디오 파일 업로드) */}
      <UploadContentModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // 콘텐츠 목록 새로고침 (필요시 구현)
          console.log('Content uploaded successfully');
        }}
      />

      {/* 미리보기 모달 */}
      {previewContent && (
        <ContentPreviewModal
          content={previewContent}
          open={!!previewContent}
          onClose={() => setPreviewContent(null)}
          onDownload={handleDownload}
        />
      )}

      {/* 수정 모달 */}
      {editContent && (
        <ContentEditModal
          content={editContent}
          open={!!editContent}
          onClose={() => setEditContent(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!deleteContent}
        title="콘텐츠 삭제"
        message={`"${deleteContent?.title}"을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteContent(null)}
      />
    </>
  );
}

