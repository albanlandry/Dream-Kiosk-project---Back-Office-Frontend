'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';

interface Resource {
  id: string;
  name: string;
  description?: string;
  images: Array<{ id: string; originalName: string; thumbnailPath?: string }>;
  videos: Array<{ id: string; userName: string; thumbnailUrl?: string }>;
  kiosks: Array<{ id: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  name: string;
  thumbnail?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

type MediaType = 'image' | 'video' | 'all';
type MediaStatus = 'active' | 'inactive' | 'all';
type SortBy = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export default function ResourcesManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMediaView, setShowMediaView] = useState(false);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: [] as string[],
    videoIds: [] as string[],
    kioskIds: [] as string[],
  });

  // Media filters and pagination - initialize from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [mediaType, setMediaType] = useState<MediaType>((searchParams.get('type') as MediaType) || 'all');
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>((searchParams.get('status') as MediaStatus) || 'all');
  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get('sort_by') as SortBy) || 'created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sort_order') as SortOrder) || 'desc');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  });

  const { showSuccess, showError } = useToastStore();

  // Update URL when filters or pagination change
  const updateURL = (updates: {
    search?: string;
    type?: MediaType;
    status?: MediaStatus;
    sort_by?: SortBy;
    sort_order?: SortOrder;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }
    
    if (updates.type !== undefined) {
      if (updates.type !== 'all') {
        params.set('type', updates.type);
      } else {
        params.delete('type');
      }
    }
    
    if (updates.status !== undefined) {
      if (updates.status !== 'all') {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }
    
    if (updates.sort_by !== undefined) {
      if (updates.sort_by !== 'created_at') {
        params.set('sort_by', updates.sort_by);
      } else {
        params.delete('sort_by');
      }
    }
    
    if (updates.sort_order !== undefined) {
      if (updates.sort_order !== 'desc') {
        params.set('sort_order', updates.sort_order);
      } else {
        params.delete('sort_order');
      }
    }
    
    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set('page', updates.page.toString());
      } else {
        params.delete('page');
      }
    }
    
    router.push(`/dashboard/content/resources?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    if (selectedResource) {
      loadMediaItems();
    }
  }, [selectedResource, searchTerm, mediaType, mediaStatus, sortBy, sortOrder, currentPage]);

  // Sync URL params on mount
  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    const urlSearch = searchParams.get('search') || '';
    const urlType = (searchParams.get('type') as MediaType) || 'all';
    const urlStatus = (searchParams.get('status') as MediaStatus) || 'all';
    const urlSortBy = (searchParams.get('sort_by') as SortBy) || 'created_at';
    const urlSortOrder = (searchParams.get('sort_order') as SortOrder) || 'desc';
    
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    if (urlType !== mediaType) setMediaType(urlType);
    if (urlStatus !== mediaStatus) setMediaStatus(urlStatus);
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
  }, [searchParams]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/resources');
      const resourcesData = response.data?.data || response.data;
      const resourcesArray = Array.isArray(resourcesData) ? resourcesData : [];
      setResources(resourcesArray);
    } catch (error: any) {
      showError('리소스를 불러오는데 실패했습니다.');
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMediaItems = async () => {
    try {
      setIsLoadingMedia(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        type: mediaType === 'all' ? undefined : mediaType,
        status: mediaStatus === 'all' ? undefined : mediaStatus,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Use the unified endpoint that combines images and videos using SQL UNION
      const response = await apiClient.get('/resources/media', { params });
      
      // Response structure: { data: { data: [...], pagination: {...} }, _links: {...} }
      const wrappedData = response.data?.data || response.data;
      const mediaData = wrappedData?.data || [];
      const paginationInfo = wrappedData?.pagination;

      // Transform the unified response to MediaItem format
      const mediaItems: MediaItem[] = (Array.isArray(mediaData) ? mediaData : []).map((item: any) => {
        // The backend already returns items with 'type' field ('image' or 'video')
        const baseItem: MediaItem = {
          id: item.id,
          type: item.type || (item.originalName ? 'image' : 'video'),
          name: item.name || item.originalName || item.userName || item.filename,
          thumbnail: item.thumbnail || item.thumbnailPath || item.thumbnailUrl,
          isActive: item.isActive !== undefined ? item.isActive : item.status === 'ready',
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        };

        // For images, construct thumbnail URL if needed
        if (baseItem.type === 'image' && baseItem.thumbnail && !baseItem.thumbnail.startsWith('http')) {
          baseItem.thumbnail = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${baseItem.id}/thumbnail`;
        }

        // For videos, handle thumbnail URL
        if (baseItem.type === 'video' && baseItem.thumbnail && !baseItem.thumbnail.startsWith('http')) {
          baseItem.thumbnail = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${baseItem.thumbnail}`;
        }

        return baseItem;
      });

      setMediaItems(mediaItems);

      // Set pagination from backend response
      if (paginationInfo) {
        setPagination({
          total: paginationInfo.total || 0,
          page: paginationInfo.page || currentPage,
          limit: paginationInfo.limit || 20,
          totalPages: paginationInfo.totalPages || 1,
          hasMore: paginationInfo.hasMore || false,
        });
      }
    } catch (error: any) {
      console.error('Error loading media:', error);
      showError('미디어를 불러오는데 실패했습니다.');
      setMediaItems([]);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
    setSelectedMediaIds([
      ...resource.images.map((img) => img.id),
      ...resource.videos.map((vid) => vid.id),
    ]);
  };

  const handleMediaSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMediaIds([...selectedMediaIds, id]);
    } else {
      setSelectedMediaIds(selectedMediaIds.filter((mediaId) => mediaId !== id));
    }
  };

  const handleValidate = async () => {
    if (!selectedResource) {
      showError('리소스를 선택해주세요.');
      return;
    }

    if (selectedMediaIds.length === 0) {
      showError('선택한 미디어가 없습니다.');
      return;
    }

    // Separate image and video IDs from selected media
    const imageIds: string[] = [];
    const videoIds: string[] = [];

    // Check all selected media IDs to determine their type
    for (const mediaId of selectedMediaIds) {
      // Try to find in current mediaItems first (most common case)
      const mediaItem = mediaItems.find((item) => item.id === mediaId);
      if (mediaItem) {
        if (mediaItem.type === 'image') {
          imageIds.push(mediaId);
        } else if (mediaItem.type === 'video') {
          videoIds.push(mediaId);
        }
      } else {
        // If not in current page, check if it's already in the selected resource
        const isImage = selectedResource.images.some((img) => img.id === mediaId);
        const isVideo = selectedResource.videos.some((vid) => vid.id === mediaId);
        
        if (isImage) {
          imageIds.push(mediaId);
        } else if (isVideo) {
          videoIds.push(mediaId);
        } else {
          // For items not in current page and not in resource, we need to check the API
          // Try to determine by checking if it exists in images or videos
          // This is a fallback - in most cases items should be in mediaItems
          try {
            // Try image first
            try {
              await apiClient.get(`/images/${mediaId}`);
              imageIds.push(mediaId);
            } catch {
              // Not an image, try video
              try {
                await apiClient.get(`/videos/${mediaId}`);
                videoIds.push(mediaId);
              } catch {
                console.warn(`Media ID ${mediaId} not found in images or videos, skipping`);
              }
            }
          } catch (error) {
            console.warn(`Failed to determine type for media ID ${mediaId}, skipping`);
          }
        }
      }
    }

    try {
      const updateData: any = {
        name: selectedResource.name,
        description: selectedResource.description || undefined,
        imageIds: imageIds,
        videoIds: videoIds,
        kioskIds: selectedResource.kiosks.map((k) => k.id),
      };

      await apiClient.patch(`/resources/${selectedResource.id}`, updateData);
      showSuccess(`리소스에 ${imageIds.length}개의 이미지와 ${videoIds.length}개의 비디오가 연결되었습니다.`);
      
      // Reload resources to reflect changes
      await loadResources();
      
      // Reload selected resource to update the UI
      const updatedResources = await apiClient.get('/resources');
      const resourcesData = updatedResources.data?.data || updatedResources.data;
      const resourcesArray = Array.isArray(resourcesData) ? resourcesData : [];
      const updatedResource = resourcesArray.find((r: Resource) => r.id === selectedResource.id);
      if (updatedResource) {
        setSelectedResource(updatedResource);
        setSelectedMediaIds([
          ...updatedResource.images.map((img) => img.id),
          ...updatedResource.videos.map((vid) => vid.id),
        ]);
      }
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      showError(error.response?.data?.message || '리소스 업데이트에 실패했습니다.');
    }
  };

  const handleClearSelection = () => {
    setSelectedMediaIds([]);
  };

  const handleOpenModal = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        description: resource.description || '',
        imageIds: resource.images.map((img) => img.id),
        videoIds: resource.videos.map((vid) => vid.id),
        kioskIds: resource.kiosks.map((kiosk) => kiosk.id),
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        description: '',
        imageIds: [],
        videoIds: [],
        kioskIds: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        imageIds: formData.imageIds.length > 0 ? formData.imageIds : undefined,
        videoIds: formData.videoIds.length > 0 ? formData.videoIds : undefined,
        kioskIds: formData.kioskIds.length > 0 ? formData.kioskIds : undefined,
      };

      if (editingResource) {
        await apiClient.patch(`/resources/${editingResource.id}`, submitData);
        showSuccess('리소스가 수정되었습니다.');
      } else {
        await apiClient.post('/resources', submitData);
        showSuccess('리소스가 생성되었습니다.');
      }
      handleCloseModal();
      loadResources();
      if (selectedResource) {
        handleSelectResource(selectedResource);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || '리소스 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 리소스를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/resources/${id}`);
      showSuccess('리소스가 삭제되었습니다.');
      if (selectedResource?.id === id) {
        setSelectedResource(null);
        setSelectedMediaIds([]);
      }
      loadResources();
    } catch (error: any) {
      showError(error.response?.data?.message || '리소스 삭제에 실패했습니다.');
    }
  };

  const getResourceMedia = (resource: Resource) => {
    return {
      images: resource.images || [],
      videos: resource.videos || [],
    };
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="리소스 관리"
        description="이미지와 비디오를 묶어 리소스 팩으로 관리하고 키오스크에 할당"
        action={{
          label: '리소스 생성',
          icon: 'fas fa-plus',
          onClick: () => handleOpenModal(),
        }}
      />
      <div className="p-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* 첫 번째 열: 리소스 목록 (1/3) */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">리소스 목록</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">리소스가 없습니다.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                {resources.map((resource) => {
                  const media = getResourceMedia(resource);
                  return (
                    <div
                      key={resource.id}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-all',
                        selectedResource?.id === resource.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => handleSelectResource(resource)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(resource);
                            }}
                            className="h-7 px-2"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(resource.id);
                            }}
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </Button>
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 mb-2">
                        <span>
                          <i className="fas fa-image mr-1"></i>
                          {media.images.length}개
                        </span>
                        <span>
                          <i className="fas fa-video mr-1"></i>
                          {media.videos.length}개
                        </span>
                      </div>
                      {/* 미디어 보기 버튼 */}
                      {(media.images.length > 0 || media.videos.length > 0) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingResource(resource);
                            setShowMediaView(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 mb-2 text-left"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          미디어 보기 ({media.images.length + media.videos.length}개)
                        </button>
                      )}
                      {/* 리소스에 속한 미디어 미리보기 */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {media.images.slice(0, 3).map((img) => (
                          <div
                            key={img.id}
                            className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100"
                          >
                            {img.thumbnailPath ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${img.id}/thumbnail`}
                                alt={img.originalName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-image text-gray-400"></i>
                              </div>
                            )}
                          </div>
                        ))}
                        {media.videos.slice(0, 3).map((vid) => (
                          <div
                            key={vid.id}
                            className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100"
                          >
                            {vid.thumbnailUrl ? (
                              <img
                                src={vid.thumbnailUrl.startsWith('http') 
                                  ? vid.thumbnailUrl 
                                  : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${vid.thumbnailUrl}`}
                                alt={vid.userName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-video text-gray-400"></i>
                              </div>
                            )}
                          </div>
                        ))}
                        {(media.images.length + media.videos.length) > 6 && (
                          <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            +{media.images.length + media.videos.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 두 번째 열: 이미지/비디오 선택 (2/3) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedResource ? `${selectedResource.name} - 미디어 선택` : '미디어 선택'}
            </h2>

            {!selectedResource ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">리소스를 선택하여 미디어를 첨부하세요.</p>
              </div>
            ) : (
              <>
                {/* 검색 및 필터 */}
                <div className="mb-4 space-y-3">
                  <Input
                    type="text"
                    placeholder="검색..."
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      setCurrentPage(1);
                      updateURL({ search: value, page: 1 });
                    }}
                    className="w-full"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={mediaType}
                      onChange={(e) => {
                        const value = e.target.value as MediaType;
                        setMediaType(value);
                        setCurrentPage(1);
                        updateURL({ type: value, page: 1 });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">전체</option>
                      <option value="image">이미지</option>
                      <option value="video">비디오</option>
                    </select>
                    <select
                      value={mediaStatus}
                      onChange={(e) => {
                        const value = e.target.value as MediaStatus;
                        setMediaStatus(value);
                        setCurrentPage(1);
                        updateURL({ status: value, page: 1 });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">전체</option>
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const value = e.target.value as SortBy;
                        setSortBy(value);
                        setCurrentPage(1);
                        updateURL({ sort_by: value, page: 1 });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="name">이름</option>
                      <option value="created_at">생성일</option>
                      <option value="updated_at">수정일</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        const value = e.target.value as SortOrder;
                        setSortOrder(value);
                        setCurrentPage(1);
                        updateURL({ sort_order: value, page: 1 });
                      }}
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
                    onClick={handleValidate}
                    className="flex-1"
                  >
                    <i className="fas fa-check mr-2"></i>
                    검증
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearSelection}
                    className="flex-1"
                  >
                    <i className="fas fa-times mr-2"></i>
                    선택 해제
                  </Button>
                </div>

                {/* 미디어 그리드 */}
                {isLoadingMedia ? (
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
                              onChange={(e) => handleMediaSelect(item.id, e.target.checked)}
                              className="absolute top-2 left-2 z-10 w-4 h-4"
                            />
                            <div className="aspect-video bg-gray-100">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
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
                                      item.type === 'image' ? 'fas fa-image' : 'fas fa-video'
                                    )}
                                  ></i>
                                </div>
                              )}
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
                                      : 'bg-blue-100 text-blue-700'
                                  )}
                                >
                                  {item.type === 'image' ? '이미지' : '비디오'}
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
                            onClick={() => {
                              const newPage = Math.max(1, currentPage - 1);
                              setCurrentPage(newPage);
                              updateURL({ page: newPage });
                            }}
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
                            onClick={() => {
                              const newPage = Math.min(pagination.totalPages, currentPage + 1);
                              setCurrentPage(newPage);
                              updateURL({ page: newPage });
                            }}
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
            )}
          </div>
        </div>
      </div>

      {/* 리소스 미디어 상세 보기 모달 */}
      {showMediaView && viewingResource && (
        <Dialog open={showMediaView} onOpenChange={() => setShowMediaView(false)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{viewingResource.name} - 미디어 목록</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* 이미지 섹션 */}
              {viewingResource.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <i className="fas fa-image mr-2"></i>
                    이미지 ({viewingResource.images.length}개)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {viewingResource.images.map((img) => (
                      <div
                        key={img.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="aspect-video bg-gray-100">
                          {img.thumbnailPath ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${img.id}/thumbnail`}
                              alt={img.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-image text-gray-400 text-2xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {img.originalName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 비디오 섹션 */}
              {viewingResource.videos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <i className="fas fa-video mr-2"></i>
                    비디오 ({viewingResource.videos.length}개)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingResource.videos.map((vid) => (
                      <div
                        key={vid.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="aspect-video bg-gray-100">
                          {vid.thumbnailUrl ? (
                            <img
                              src={vid.thumbnailUrl.startsWith('http') 
                                ? vid.thumbnailUrl 
                                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${vid.thumbnailUrl}`}
                              alt={vid.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-video text-gray-400 text-2xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-800">{vid.userName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingResource.images.length === 0 && viewingResource.videos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  이 리소스에 첨부된 미디어가 없습니다.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 리소스 생성/수정 모달 */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? '리소스 수정' : '리소스 생성'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  리소스 이름 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 강남점 리소스 팩"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="리소스에 대한 설명을 입력하세요."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                >
                  {editingResource ? '수정' : '생성'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
