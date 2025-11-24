'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { UploadImageModal } from '@/components/content/UploadImageModal';
import { cn } from '@/lib/utils/cn';
import { getResourceThumbnailUrl } from '@/lib/utils/thumbnail';
import { Pagination } from '@/components/ui/pagination';

interface Image {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  thumbnailPath?: string;
  description?: string;
  width: number;
  height: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function ImagesManagementPage() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
    loadImages();
  }, [currentPage]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        active_only: false,
        page: currentPage,
        limit: 20,
      };
      
      // 검색어가 있으면 파라미터에 추가 (백엔드에서 검색 지원 시)
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiClient.get('/images', { params });
      // HATEOAS 응답 구조: { data: { images: [...], total_count: ..., pagination: {...} }, _links: {...} }
      const responseData = response.data?.data || response.data;
      
      // 페이징 정보 확인
      if (responseData.pagination) {
        const imagesArray = responseData.images || responseData.data || [];
        setPagination(responseData.pagination);
        
        // API 응답 형식을 프론트엔드 형식으로 변환
        const formattedImages = imagesArray.map((img: any) => ({
          id: img.image_id || img.id,
          filename: img.filename,
          originalName: img.filename || img.originalName,
          mimeType: img.mime_type || img.mimeType,
          size: img.size,
          filePath: img.url || img.filePath,
          thumbnailPath: img.thumbnail_url || img.thumbnailPath,
          description: img.description,
          width: img.width,
          height: img.height,
          isActive: img.is_active !== undefined ? img.is_active : img.isActive !== undefined ? img.isActive : true,
          createdAt: img.created_at || img.createdAt,
          updatedAt: img.updated_at || img.updatedAt,
        }));
        
        setImages(formattedImages);
      } else {
        // 페이징 정보가 없는 경우 (기존 형식)
        const imagesArray = responseData?.images || responseData || [];
        
        // API 응답 형식을 프론트엔드 형식으로 변환
        const formattedImages = imagesArray.map((img: any) => ({
          id: img.image_id || img.id,
          filename: img.filename,
          originalName: img.filename || img.originalName,
          mimeType: img.mime_type || img.mimeType,
          size: img.size,
          filePath: img.url || img.filePath,
          thumbnailPath: img.thumbnail_url || img.thumbnailPath,
          description: img.description,
          width: img.width,
          height: img.height,
          isActive: img.is_active !== undefined ? img.is_active : img.isActive !== undefined ? img.isActive : true,
          createdAt: img.created_at || img.createdAt,
          updatedAt: img.updated_at || img.updatedAt,
        }));
        
        setImages(formattedImages);
        setPagination({
          total: formattedImages.length,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasMore: false,
        });
      }
    } catch (error: any) {
      showError('이미지 목록을 불러오는데 실패했습니다.');
      setImages([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/images/${id}`);
      showSuccess('이미지가 삭제되었습니다.');
      loadImages();
    } catch (error: any) {
      showError(error.response?.data?.message || '이미지 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/images/${id}/toggle-active`);
      showSuccess(`이미지가 ${currentStatus ? '비활성화' : '활성화'}되었습니다.`);
      loadImages();
    } catch (error: any) {
      showError(error.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(displayedImages.map(img => img.id));
    } else {
      setSelectedImages([]);
    }
  };

  const handleSelectImage = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedImages([...selectedImages, id]);
    } else {
      setSelectedImages(selectedImages.filter(imgId => imgId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) {
      showError('삭제할 이미지를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedImages.length}개의 이미지를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await apiClient.post('/images/bulk/delete', { ids: selectedImages });
      const result = response.data?.data || response.data;
      showSuccess(`${result.deleted}개의 이미지가 삭제되었습니다.${result.failed > 0 ? ` (${result.failed}개 실패)` : ''}`);
      setSelectedImages([]);
      loadImages();
    } catch (error: any) {
      showError(error.response?.data?.message || '일괄 삭제에 실패했습니다.');
    }
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedImages.length === 0) {
      showError(`${isActive ? '활성화' : '비활성화'}할 이미지를 선택해주세요.`);
      return;
    }

    try {
      const response = await apiClient.post('/images/bulk/toggle-active', {
        ids: selectedImages,
        isActive,
      });
      const result = response.data?.data || response.data;
      showSuccess(`${result.updated}개의 이미지가 ${isActive ? '활성화' : '비활성화'}되었습니다.${result.failed > 0 ? ` (${result.failed}개 실패)` : ''}`);
      setSelectedImages([]);
      loadImages();
    } catch (error: any) {
      showError(error.response?.data?.message || `일괄 ${isActive ? '활성화' : '비활성화'}에 실패했습니다.`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedImages([]); // 페이지 변경 시 선택 해제
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 검색어가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // 검색어가 있을 때는 클라이언트 사이드 필터링 사용
  // 검색어가 없을 때는 서버 페이징 사용
  const displayedImages = searchTerm
    ? images.filter((image) =>
        image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : images;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="이미지 관리"
        description="이미지 업로드 및 관리"
        action={{
          label: '이미지 업로드',
          icon: 'fas fa-upload',
          onClick: () => setShowUploadModal(true),
        }}
      />
      <div className="p-8 min-h-screen">
        {/* 검색 및 일괄 작업 */}
        <div className={cn(
          "mb-6 transition-all duration-200",
          selectedImages.length > 0 && "sticky top-0 z-50 bg-white py-4 -mx-8 px-8 shadow-md border-b border-gray-200"
        )}>
          <div className="flex gap-2 items-center justify-between">
            <Input
              type="text"
              placeholder="이미지 이름 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {selectedImages.length > 0 && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 self-center">
                  {selectedImages.length}개 선택됨
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkToggleActive(true)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <i className="fas fa-eye mr-1"></i>
                  활성화
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkToggleActive(false)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <i className="fas fa-eye-slash mr-1"></i>
                  비활성화
                </Button>
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
                  onClick={() => setSelectedImages([])}
                >
                  선택 해제
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 이미지 그리드 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : displayedImages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '이미지가 없습니다.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedImages.length === displayedImages.length && displayedImages.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">전체 선택</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedImages.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow",
                  selectedImages.includes(image.id) && "ring-2 ring-blue-500"
                )}
              >
                <div className="mb-2">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={(e) => handleSelectImage(image.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
                <div className="relative aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {(() => {
                    const thumbnailUrl = getResourceThumbnailUrl(image.id, 'image', image.thumbnailPath);
                    return thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={image.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to original image if thumbnail fails
                          const target = e.target as HTMLImageElement;
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
                          target.src = `${apiUrl}/api/v1/images/${image.id}/file`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-image text-gray-400 text-4xl"></i>
                      </div>
                    );
                  })()}
                  <div
                    className={cn(
                      'absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold',
                      image.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    )}
                  >
                    {image.isActive ? '활성' : '비활성'}
                  </div>
                </div>
                <div className="mb-2">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {image.originalName}
                  </p>
                  {image.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {image.width} × {image.height} • {(image.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(image.id, image.isActive)}
                    className="flex-1"
                  >
                    <i className={cn('mr-1', image.isActive ? 'fas fa-eye-slash' : 'fas fa-eye')}></i>
                    {image.isActive ? '비활성화' : '활성화'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
            </div>
            
            {/* 페이징 */}
            {!searchTerm && pagination.totalPages > 1 && (
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
            
            {/* 검색 결과 정보 */}
            {searchTerm && displayedImages.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                검색 결과: {displayedImages.length}개
              </div>
            )}
          </>
        )}
      </div>

      {/* 이미지 업로드 모달 */}
      <UploadImageModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          loadImages();
        }}
      />
    </>
  );
}

