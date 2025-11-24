'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { UploadVideoModal } from '@/components/content/UploadVideoModal';
import { cn } from '@/lib/utils/cn';
import { getResourceThumbnailUrl } from '@/lib/utils/thumbnail';
import { Pagination } from '@/components/ui/pagination';

interface Video {
  id: string;
  backgroundVideoId: string;
  userPicture: string;
  userName: string;
  userMessage: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  priority: number;
  displayPeriodStart?: Date;
  displayPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function VideosManagementPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  });
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadVideos();
  }, [currentPage]);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/videos', {
        params: {
          page: currentPage,
          limit: 20,
        },
      });
      // HATEOAS 응답 구조 처리
      const responseData = response.data?.data || response.data;
      
      // 페이징 정보 확인
      if (responseData.pagination) {
        const videosArray = responseData.data || [];
        setPagination(responseData.pagination);
        
        // API 응답 형식을 프론트엔드 형식으로 변환
        const formattedVideos = videosArray.map((video: any) => ({
          id: video.video_id || video.id,
          backgroundVideoId: video.backgroundVideoId,
          userPicture: video.userPicture,
          userName: video.userName,
          userMessage: video.userMessage,
          videoUrl: video.videoUrl || video.video_url,
          thumbnailUrl: video.thumbnailUrl || video.thumbnail_url,
          status: video.status,
          priority: video.priority,
          displayPeriodStart: video.displayPeriodStart || video.display_period_start,
          displayPeriodEnd: video.displayPeriodEnd || video.display_period_end,
          createdAt: video.createdAt || video.created_at,
          updatedAt: video.updatedAt || video.updated_at,
        }));
        
        setVideos(formattedVideos);
      } else {
        // 페이징 정보가 없는 경우 (기존 형식)
        const videosArray = Array.isArray(responseData) ? responseData : [];
        
        // API 응답 형식을 프론트엔드 형식으로 변환
        const formattedVideos = videosArray.map((video: any) => ({
          id: video.video_id || video.id,
          backgroundVideoId: video.backgroundVideoId,
          userPicture: video.userPicture,
          userName: video.userName,
          userMessage: video.userMessage,
          videoUrl: video.videoUrl || video.video_url,
          thumbnailUrl: video.thumbnailUrl || video.thumbnail_url,
          status: video.status,
          priority: video.priority,
          displayPeriodStart: video.displayPeriodStart || video.display_period_start,
          displayPeriodEnd: video.displayPeriodEnd || video.display_period_end,
          createdAt: video.createdAt || video.created_at,
          updatedAt: video.updatedAt || video.updated_at,
        }));
        
        setVideos(formattedVideos);
        setPagination({
          total: formattedVideos.length,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasMore: false,
        });
      }
    } catch (error: any) {
      showError('비디오 목록을 불러오는데 실패했습니다.');
      setVideos([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 비디오를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/videos/${id}`);
      showSuccess('비디오가 삭제되었습니다.');
      loadVideos();
    } catch (error: any) {
      showError(error.response?.data?.message || '비디오 삭제에 실패했습니다.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(filteredVideos.map(video => video.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleSelectVideo = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos([...selectedVideos, id]);
    } else {
      setSelectedVideos(selectedVideos.filter(videoId => videoId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) {
      showError('삭제할 비디오를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedVideos.length}개의 비디오를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await apiClient.post('/videos/bulk/delete', { ids: selectedVideos });
      const result = response.data?.data || response.data;
      showSuccess(`${result.deleted}개의 비디오가 삭제되었습니다.${result.failed > 0 ? ` (${result.failed}개 실패)` : ''}`);
      setSelectedVideos([]);
      loadVideos();
    } catch (error: any) {
      showError(error.response?.data?.message || '일괄 삭제에 실패했습니다.');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedVideos([]); // 페이지 변경 시 선택 해제
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      processing: { label: '처리 중', class: 'bg-yellow-100 text-yellow-800' },
      ready: { label: '준비됨', class: 'bg-green-100 text-green-800' },
      failed: { label: '실패', class: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.processing;
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', statusInfo.class)}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.userMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="비디오 관리"
        description="비디오 목록 및 관리"
        action={{
          label: '비디오 업로드',
          icon: 'fas fa-upload',
          onClick: () => setShowUploadModal(true),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 검색 및 일괄 작업 */}
        <div className={cn(
          "mb-6 transition-all duration-200",
          selectedVideos.length > 0 && "sticky top-0 z-50 bg-white py-4 -mx-8 px-8 shadow-md border-b border-gray-200"
        )}>
          <div className="flex gap-2 items-center justify-between">
          <Input
            type="text"
            placeholder="사용자 이름 또는 메시지로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
            {selectedVideos.length > 0 && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 self-center">
                  {selectedVideos.length}개 선택됨
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <i className="fas fa-trash mr-1"></i>
                  삭제
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedVideos([])}
                >
                  선택 해제
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 비디오 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">비디오가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">전체 선택</span>
              </label>
            </div>
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className={cn(
                  "bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow",
                  selectedVideos.includes(video.id) && "ring-2 ring-blue-500"
                )}
              >
                <div className="mb-4">
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video.id)}
                    onChange={(e) => handleSelectVideo(video.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                <div className="grid grid-cols-[200px_1fr_auto] gap-6">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {(() => {
                      const thumbnailUrl = getResourceThumbnailUrl(video.id, 'video', video.thumbnailUrl);
                      return thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={video.userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-video text-gray-400 text-4xl"></i>
                        </div>
                      );
                    })()}
                    <div className="absolute top-2 right-2">
                    {getStatusBadge(video.status)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {video.userName}의 비디오
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {video.userMessage}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span>
                        <i className="fas fa-sort-numeric-up mr-1"></i>
                        우선순위: {video.priority}
                      </span>
                      {video.displayPeriodStart && video.displayPeriodEnd && (
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {new Date(video.displayPeriodStart).toLocaleDateString('ko-KR')} ~{' '}
                          {new Date(video.displayPeriodEnd).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {video.videoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                        className="w-full"
                      >
                        <i className="fas fa-play mr-2"></i>재생
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(video.id)}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fas fa-trash mr-2"></i>삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 페이징 */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
                <div className="text-center mt-4 text-sm text-gray-600">
                  총 {pagination.total}개 중 {((currentPage - 1) * pagination.limit) + 1}-
                  {Math.min(currentPage * pagination.limit, pagination.total)}개 표시
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 비디오 업로드 모달 */}
      <UploadVideoModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          loadVideos();
        }}
      />
    </>
  );
}

