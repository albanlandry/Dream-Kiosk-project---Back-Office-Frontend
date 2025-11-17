'use client';

import { cn } from '@/lib/utils/cn';
import { MediaSelectionTab, MediaItem, Pagination } from './MediaSelectionTab';
import { KioskSelectionTab } from './KioskSelectionTab';

type MediaType = 'image' | 'video' | 'animal' | 'all';
type MediaStatus = 'active' | 'inactive' | 'all';
type SortBy = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface ResourceTabsProps {
  activeTab: 'media' | 'kiosk';
  selectedResourceName: string;
  onTabChange: (tab: 'media' | 'kiosk') => void;
  // Media tab props
  mediaItems: MediaItem[];
  selectedMediaIds: string[];
  isLoadingMedia: boolean;
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
  // Kiosk tab props
  kiosks: Array<{ id: string; name: string; location: string; status: string }>;
  selectedKioskIds: string[];
  isLoadingKiosks: boolean;
  onKioskSelect: (id: string, checked: boolean) => void;
  onKioskSelectAll: (checked: boolean) => void;
  onKioskValidate: () => void;
  onKioskReset: () => void;
}

export function ResourceTabs({
  activeTab,
  selectedResourceName,
  onTabChange,
  mediaItems,
  selectedMediaIds,
  isLoadingMedia,
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
  kiosks,
  selectedKioskIds,
  isLoadingKiosks,
  onKioskSelect,
  onKioskSelectAll,
  onKioskValidate,
  onKioskReset,
}: ResourceTabsProps) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col">
        {/* 탭 네비게이션 */}
        <div className="flex gap-2 border-b-2 border-gray-200 mb-4">
          <button
            onClick={() => onTabChange('media')}
            className={cn(
              'px-6 py-3 font-semibold text-sm transition-all relative',
              activeTab === 'media'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-blue-500'
            )}
          >
            <i className="fas fa-images mr-2"></i>
            미디어 선택
            {activeTab === 'media' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => onTabChange('kiosk')}
            className={cn(
              'px-6 py-3 font-semibold text-sm transition-all relative',
              activeTab === 'kiosk'
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-blue-500'
            )}
          >
            <i className="fas fa-desktop mr-2"></i>
            키오스크 선택
            {activeTab === 'kiosk' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        </div>

        {/* 미디어 선택 탭 */}
        {activeTab === 'media' && (
          <MediaSelectionTab
            mediaItems={mediaItems}
            selectedMediaIds={selectedMediaIds}
            isLoading={isLoadingMedia}
            searchTerm={searchTerm}
            mediaType={mediaType}
            mediaStatus={mediaStatus}
            sortBy={sortBy}
            sortOrder={sortOrder}
            currentPage={currentPage}
            pagination={pagination}
            onSearchChange={onSearchChange}
            onMediaTypeChange={onMediaTypeChange}
            onMediaStatusChange={onMediaStatusChange}
            onSortByChange={onSortByChange}
            onSortOrderChange={onSortOrderChange}
            onPageChange={onPageChange}
            onMediaSelect={onMediaSelect}
            onValidate={onValidate}
            onClearSelection={onClearSelection}
          />
        )}

        {/* 키오스크 선택 탭 */}
        {activeTab === 'kiosk' && (
          <KioskSelectionTab
            kiosks={kiosks}
            selectedKioskIds={selectedKioskIds}
            isLoading={isLoadingKiosks}
            resourceName={selectedResourceName}
            onKioskSelect={onKioskSelect}
            onSelectAll={onKioskSelectAll}
            onValidate={onKioskValidate}
            onReset={onKioskReset}
          />
        )}
      </div>
    </>
  );
}

