'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { useUIStore, type MediaType, type MediaStatus, type SortBy, type SortOrder, type ResourcePageTab } from '@/lib/store/uiStore';
import { ResourceList, Resource } from '@/components/resources/ResourceList';
import { ResourceTabs } from '@/components/resources/ResourceTabs';
import { MediaViewModal } from '@/components/resources/MediaViewModal';
import { ResourceFormModal } from '@/components/resources/ResourceFormModal';
import { MediaItem, Pagination } from '@/components/resources/MediaSelectionTab';

export default function ResourcesManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get UI state from store (localStorage)
  const { resourcePage, setResourcePageState } = useUIStore();
  
  // Get selected resource ID from query parameter
  const selectedResourceId = searchParams.get('resourceId');
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  
  // Use UI store for tab and filters (localStorage)
  // Initialize from UI store, but keep local state for reactivity
  const [activeTab, setActiveTabState] = useState<ResourcePageTab>(resourcePage.activeTab);
  const [searchTerm, setSearchTerm] = useState(resourcePage.searchTerm);
  const [mediaType, setMediaType] = useState<MediaType>(resourcePage.mediaType);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>(resourcePage.mediaStatus);
  const [sortBy, setSortBy] = useState<SortBy>(resourcePage.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(resourcePage.sortOrder);
  
  // Wrapper for setActiveTab that also updates UI store
  const setActiveTab = (tab: ResourcePageTab) => {
    console.log('setActiveTab', tab);
    setActiveTabState(tab);
    setResourcePageState({ activeTab: tab });
  };
  
  // Pagination from URL params
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    totalPages: 1,
    hasMore: false,
  });
  
  const [kiosks, setKiosks] = useState<Array<{ id: string; name: string; location: string; status: string }>>([]);
  const [isLoadingKiosks, setIsLoadingKiosks] = useState(false);
  const [selectedKioskIds, setSelectedKioskIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showMediaView, setShowMediaView] = useState(false);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: [] as string[],
    videoIds: [] as string[],
    animalIds: [] as string[],
    kioskIds: [] as string[],
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

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  // Restore tab state from UI store on mount
  useEffect(() => {
    const storedTab = resourcePage.activeTab;
    if (storedTab && storedTab !== activeTab) {
      setActiveTabState(storedTab);
    }

    console.log('storedTab', storedTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to restore from localStorage

  // Sync selected resource from query parameter
  useEffect(() => {
    if (selectedResourceId && resources.length > 0) {
      const resource = resources.find((r) => r.id === selectedResourceId);
      if (resource && resource.id !== selectedResource?.id) {
        handleSelectResource(resource);
      }
    } else if (!selectedResourceId && selectedResource) {
      // Clear selection if resourceId is removed from URL
      setSelectedResource(null);
      setSelectedMediaIds([]);
      setSelectedKioskIds([]);
    }
  }, [selectedResourceId, resources]);

  // Load media/kiosks when resource or filters change
  useEffect(() => {
    if (selectedResource) {
      if (activeTab === 'media') {
        loadMediaItems();
      } else if (activeTab === 'kiosk') {
        loadKiosks();
        setSelectedKioskIds(selectedResource.kiosks.map((k: { id: string }) => k.id));
      }
    }
  }, [selectedResource, activeTab, searchTerm, mediaType, mediaStatus, sortBy, sortOrder, currentPage]);

  // Sync UI state to localStorage when filters/tab change
  useEffect(() => {
    setResourcePageState({
      activeTab,
      searchTerm,
      mediaType,
      mediaStatus,
      sortBy,
      sortOrder,
    });
  }, [activeTab, searchTerm, mediaType, mediaStatus, sortBy, sortOrder, setResourcePageState]);

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
        // The backend already returns items with 'type' field ('image', 'video', or 'animal')
        const baseItem: MediaItem = {
          id: item.id,
          type: item.media_type || item.type || (item.originalName ? 'image' : item.userName ? 'video' : 'animal'),
          name: item.name || item.originalName || item.userName || item.filename,
          thumbnail: item.thumbnail || item.thumbnailPath || item.thumbnailUrl,
          isActive: item.isActive !== undefined ? item.isActive : item.is_active !== undefined ? item.is_active : item.status === 'ready',
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

        // For animals, handle thumbnail URL
        if (baseItem.type === 'animal' && baseItem.thumbnail && !baseItem.thumbnail.startsWith('http')) {
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
      ...(resource.animals || []).map((animal) => animal.id),
    ]);
    setSelectedKioskIds(resource.kiosks.map((k: { id: string }) => k.id));
    
    // Update URL with resource ID
    const params = new URLSearchParams(searchParams.toString());
    params.set('resourceId', resource.id);
    router.push(`/dashboard/content/resources?${params.toString()}`, { scroll: false });
  };

  const loadKiosks = async () => {
    try {
      setIsLoadingKiosks(true);
      const response = await apiClient.get('/kiosks');
      const kiosksData = response.data?.data || response.data;
      const kiosksArray = Array.isArray(kiosksData) ? kiosksData : [];
      setKiosks(kiosksArray.map((k: any) => ({
        id: k.id,
        name: k.name,
        location: k.location,
        status: k.status || 'offline',
      })));
    } catch (error: any) {
      showError('키오스크 목록을 불러오는데 실패했습니다.');
      setKiosks([]);
    } finally {
      setIsLoadingKiosks(false);
    }
  };

  const handleKioskSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedKioskIds([...selectedKioskIds, id]);
    } else {
      setSelectedKioskIds(selectedKioskIds.filter((kioskId) => kioskId !== id));
    }
  };

  const handleKioskSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKioskIds(kiosks.map((k) => k.id));
    } else {
      setSelectedKioskIds([]);
    }
  };

  const handleKioskValidate = async () => {
    if (!selectedResource) {
      showError('리소스를 선택해주세요.');
      return;
    }

    try {
      const updateData: any = {
        name: selectedResource.name,
        description: selectedResource.description || undefined,
        imageIds: selectedResource.images.map((img) => img.id),
        videoIds: selectedResource.videos.map((vid) => vid.id),
        animalIds: (selectedResource.animals || []).map((animal) => animal.id),
        kioskIds: selectedKioskIds,
      };

      await apiClient.patch(`/resources/${selectedResource.id}`, updateData);
      const kioskCount = selectedKioskIds.length;
      showSuccess(`리소스에 ${kioskCount}개의 키오스크가 연결되었습니다.`);
      
      // Reload resources to reflect changes
      await loadResources();
      
      // Reload selected resource to update the UI
      const updatedResources = await apiClient.get('/resources');
      const resourcesData = updatedResources.data?.data || updatedResources.data;
      const resourcesArray = Array.isArray(resourcesData) ? resourcesData : [];
      const updatedResource = resourcesArray.find((r: Resource) => r.id === selectedResource.id);
      if (updatedResource) {
        setSelectedResource(updatedResource);
        setSelectedKioskIds(updatedResource.kiosks.map((k: { id: string }) => k.id));
      }
    } catch (error: any) {
      console.error('Failed to update resource kiosks:', error);
      showError(error.response?.data?.message || '키오스크 연결에 실패했습니다.');
    }
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

    // Separate image, video, and animal IDs from selected media
    const imageIds: string[] = [];
    const videoIds: string[] = [];
    const animalIds: string[] = [];

    // Check all selected media IDs to determine their type
    for (const mediaId of selectedMediaIds) {
      // Try to find in current mediaItems first (most common case)
      const mediaItem = mediaItems.find((item) => item.id === mediaId);
      if (mediaItem) {
        if (mediaItem.type === 'image') {
          imageIds.push(mediaId);
        } else if (mediaItem.type === 'video') {
          videoIds.push(mediaId);
        } else if (mediaItem.type === 'animal') {
          animalIds.push(mediaId);
        }
      } else {
        // If not in current page, check if it's already in the selected resource
        const isImage = selectedResource.images.some((img) => img.id === mediaId);
        const isVideo = selectedResource.videos.some((vid) => vid.id === mediaId);
        const isAnimal = (selectedResource.animals || []).some((animal) => animal.id === mediaId);
        
        if (isImage) {
          imageIds.push(mediaId);
        } else if (isVideo) {
          videoIds.push(mediaId);
        } else if (isAnimal) {
          animalIds.push(mediaId);
        } else {
          // For items not in current page and not in resource, we need to check the API
          // Try to determine by checking if it exists in images, videos, or animals
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
                // Not a video, try animal
                try {
                  await apiClient.get(`/animals/${mediaId}`);
                  animalIds.push(mediaId);
                } catch {
                  console.warn(`Media ID ${mediaId} not found in images, videos, or animals, skipping`);
                }
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
        animalIds: animalIds,
        kioskIds: selectedResource.kiosks.map((k) => k.id),
      };

      await apiClient.patch(`/resources/${selectedResource.id}`, updateData);
      const mediaCounts = [];
      if (imageIds.length > 0) mediaCounts.push(`${imageIds.length}개의 이미지`);
      if (videoIds.length > 0) mediaCounts.push(`${videoIds.length}개의 비디오`);
      if (animalIds.length > 0) mediaCounts.push(`${animalIds.length}개의 동물`);
      showSuccess(`리소스에 ${mediaCounts.join(', ')}가 연결되었습니다.`);
      
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
          ...updatedResource.images.map((img: { id: string }) => img.id),
          ...updatedResource.videos.map((vid: { id: string }) => vid.id),
          ...(updatedResource.animals || []).map((animal: { id: string }) => animal.id),
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
        animalIds: (resource.animals || []).map((animal) => animal.id),
        kioskIds: resource.kiosks.map((kiosk) => kiosk.id),
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        description: '',
        imageIds: [],
        videoIds: [],
        animalIds: [],
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

  return (
    <>
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
          <ResourceList
            resources={resources}
            selectedResource={selectedResource}
            isLoading={isLoading}
            onSelectResource={handleSelectResource}
            onEditResource={(resource) => handleOpenModal(resource)}
            onDeleteResource={handleDelete}
            onViewMedia={(resource) => {
              setViewingResource(resource);
              setShowMediaView(true);
            }}
          />

          {/* 두 번째 열: 탭 컨테이너 (2/3) */}
          {!selectedResource ? (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">리소스를 선택하여 미디어를 첨부하거나 키오스크를 연결하세요.</p>
              </div>
            </div>
          ) : (
            <ResourceTabs
              activeTab={activeTab}
              selectedResourceName={selectedResource.name}
              onTabChange={setActiveTab}
              mediaItems={mediaItems}
              selectedMediaIds={selectedMediaIds}
              isLoadingMedia={isLoadingMedia}
              searchTerm={searchTerm}
              mediaType={mediaType}
              mediaStatus={mediaStatus}
              sortBy={sortBy}
              sortOrder={sortOrder}
              currentPage={currentPage}
              pagination={pagination}
              onSearchChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
                setResourcePageState({ searchTerm: value });
                updateURL({ search: value, page: 1 });
              }}
              onMediaTypeChange={(value) => {
                setMediaType(value);
                setCurrentPage(1);
                setResourcePageState({ mediaType: value });
                updateURL({ type: value, page: 1 });
              }}
              onMediaStatusChange={(value) => {
                setMediaStatus(value);
                setCurrentPage(1);
                setResourcePageState({ mediaStatus: value });
                updateURL({ status: value, page: 1 });
              }}
              onSortByChange={(value) => {
                setSortBy(value);
                setCurrentPage(1);
                setResourcePageState({ sortBy: value });
                updateURL({ sort_by: value, page: 1 });
              }}
              onSortOrderChange={(value) => {
                setSortOrder(value);
                setCurrentPage(1);
                setResourcePageState({ sortOrder: value });
                updateURL({ sort_order: value, page: 1 });
              }}
              onPageChange={(page) => {
                setCurrentPage(page);
                updateURL({ page });
              }}
              onMediaSelect={handleMediaSelect}
              onValidate={handleValidate}
              onClearSelection={handleClearSelection}
              kiosks={kiosks}
              selectedKioskIds={selectedKioskIds}
              isLoadingKiosks={isLoadingKiosks}
              onKioskSelect={handleKioskSelect}
              onKioskSelectAll={handleKioskSelectAll}
              onKioskValidate={handleKioskValidate}
              onKioskReset={() => setSelectedKioskIds(selectedResource.kiosks.map((k: { id: string }) => k.id))}
            />
          )}
        </div>
      </div>

      {/* 리소스 미디어 상세 보기 모달 */}
      <MediaViewModal
        open={showMediaView}
        resource={viewingResource}
        onClose={() => setShowMediaView(false)}
      />

      {/* 리소스 생성/수정 모달 */}
      <ResourceFormModal
        open={showModal}
        editingResource={editingResource}
        formData={formData}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />
    </>
  );
}
