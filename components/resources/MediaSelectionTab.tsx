'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { getResourceThumbnailUrl } from '@/lib/utils/thumbnail';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'animal';
  name: string;
  thumbnail?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

type MediaType = 'image' | 'video' | 'animal' | 'all';
type MediaStatus = 'active' | 'inactive' | 'all';
type SortBy = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface MediaSelectionTabProps {
  mediaItems: MediaItem[];
  selectedMediaIds: string[];
  isLoading: boolean;
  searchTerm: string;
  mediaType: MediaType;
  mediaStatus: MediaStatus;
  sortBy: SortBy;
  sortOrder: SortOrder;
  currentPage: number;
  pagination: Pagination;
  onSearchChange: (value: string) => void;
  onMediaTypeChange: (value: MediaType) => void;
  onMediaStatusChange: (value: MediaStatus) => void;
  onSortByChange: (value: SortBy) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onPageChange: (page: number) => void;
  onMediaSelect: (id: string, checked: boolean) => void;
  onValidate: () => void;
  onClearSelection: () => void;
}

export function MediaSelectionTab({
  mediaItems,
  selectedMediaIds,
  isLoading,
  searchTerm,
  mediaType,
  mediaStatus,
  sortBy,
  sortOrder,
  currentPage,
  pagination,
  onSearchChange,
  onMediaTypeChange,
  onMediaStatusChange,
  onSortByChange,
  onSortOrderChange,
  onPageChange,
  onMediaSelect,
  onValidate,
  onClearSelection,
}: MediaSelectionTabProps) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      {/* 검색 및 필터 */}
      <div className="mb-4 space-y-3">
        <Input
          type="text"
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={mediaType}
            onChange={(e) => onMediaTypeChange(e.target.value as MediaType)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">전체</option>
            <option value="image">이미지</option>
            <option value="video">비디오</option>
            <option value="animal">동물</option>
          </select>
          <select
            value={mediaStatus}
            onChange={(e) => onMediaStatusChange(e.target.value as MediaStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="name">이름</option>
            <option value="created_at">생성일</option>
            <option value="updated_at">수정일</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onValidate}
          className="flex-1"
        >
          <i className="fas fa-check mr-2"></i>
          검증
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearSelection}
          className="flex-1"
        >
          <i className="fas fa-times mr-2"></i>
          선택 해제
        </Button>
      </div>

      {/* 미디어 그리드 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">미디어가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mediaItems.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    'relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all',
                    selectedMediaIds.includes(item.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedMediaIds.includes(item.id)}
                    onChange={(e) => onMediaSelect(item.id, e.target.checked)}
                    className="absolute top-2 left-2 z-10 w-4 h-4"
                  />
                  <div className="aspect-video bg-gray-100">
                    {(() => {
                      const thumbnailUrl = getResourceThumbnailUrl(
                        item.id,
                        item.type,
                        item.thumbnail,
                      );
                      return thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i
                            className={cn(
                              'text-gray-400 text-2xl',
                              item.type === 'image' 
                                ? 'fas fa-image' 
                                : item.type === 'video' 
                                ? 'fas fa-video' 
                                : 'fas fa-paw'
                            )}
                          ></i>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          item.type === 'image'
                            ? 'bg-purple-100 text-purple-700'
                            : item.type === 'video'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        )}
                      >
                        {item.type === 'image' ? '이미지' : item.type === 'video' ? '비디오' : '동물'}
                      </span>
                      {item.isActive !== undefined && (
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            item.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {item.isActive ? '활성' : '비활성'}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                총 {pagination.total}개 중 {((currentPage - 1) * pagination.limit) + 1}-
                {Math.min(currentPage * pagination.limit, pagination.total)}개 표시
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="px-3 py-1 text-sm">
                  {currentPage} / {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage >= pagination.totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

