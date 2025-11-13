'use client';

import { useState, useEffect } from 'react';
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

interface Image {
  id: string;
  originalName: string;
  thumbnailPath?: string;
}

interface Video {
  id: string;
  userName: string;
  thumbnailUrl?: string;
}

interface Kiosk {
  id: string;
  name: string;
}

export default function ResourcesManagementPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageIds: [] as string[],
    videoIds: [] as string[],
    kioskIds: [] as string[],
  });
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resourcesRes, imagesRes, videosRes, kiosksRes] = await Promise.all([
        apiClient.get('/resources'),
        apiClient.get('/images?active_only=false'),
        apiClient.get('/videos'),
        apiClient.get('/kiosks'),
      ]);

      // HATEOAS 응답 구조 처리
      const resourcesData = resourcesRes.data?.data || resourcesRes.data;
      const resourcesArray = Array.isArray(resourcesData) ? resourcesData : [];
      setResources(resourcesArray);

      const imagesData = imagesRes.data?.data || imagesRes.data;
      const imagesArray = (imagesData?.images || imagesData || []).map((img: any) => ({
        id: img.image_id || img.id,
        originalName: img.filename || img.originalName,
        thumbnailPath: img.thumbnail_url || img.thumbnailPath,
      }));
      setImages(imagesArray);

      const videosData = videosRes.data?.data || videosRes.data;
      const videosArray = (Array.isArray(videosData) ? videosData : []).map((vid: any) => ({
        id: vid.video_id || vid.id,
        userName: vid.userName,
        thumbnailUrl: vid.thumbnailUrl || vid.thumbnail_url,
      }));
      setVideos(videosArray);

      const kiosksData = kiosksRes.data?.data || kiosksRes.data;
      const kiosksArray = (Array.isArray(kiosksData) ? kiosksData : []).map((kiosk: any) => ({
        id: kiosk.id,
        name: kiosk.name,
      }));
      setKiosks(kiosksArray);
    } catch (error: any) {
      showError('데이터를 불러오는데 실패했습니다.');
      setResources([]);
      setImages([]);
      setVideos([]);
      setKiosks([]);
    } finally {
      setIsLoading(false);
    }
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
      if (editingResource) {
        await apiClient.patch(`/resources/${editingResource.id}`, formData);
        showSuccess('리소스가 수정되었습니다.');
      } else {
        await apiClient.post('/resources', formData);
        showSuccess('리소스가 생성되었습니다.');
      }
      handleCloseModal();
      loadData();
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
      loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || '리소스 삭제에 실패했습니다.');
    }
  };

  const toggleSelection = (
    type: 'image' | 'video' | 'kiosk',
    id: string,
    checked: boolean
  ) => {
    const key = `${type}Ids` as keyof typeof formData;
    const currentIds = formData[key] as string[];
    if (checked) {
      setFormData({ ...formData, [key]: [...currentIds, id] });
    } else {
      setFormData({ ...formData, [key]: currentIds.filter((itemId) => itemId !== id) });
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Header
        title="리소스 관리"
        description="이미지와 비디오를 묶어 키오스크에 할당"
        action={{
          label: '리소스 생성',
          icon: 'fas fa-plus',
          onClick: () => handleOpenModal(),
        }}
      />
      <div className="p-8 min-h-screen">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">리소스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.name}</h3>
                  {resource.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-image"></i>
                    <span>이미지: {resource.images.length}개</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-video"></i>
                    <span>비디오: {resource.videos.length}개</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-desktop"></i>
                    <span>키오스크: {resource.kiosks.length}개</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(resource)}
                    className="flex-1"
                  >
                    <i className="fas fa-edit mr-2"></i>수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

              {/* 이미지 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  이미지 선택
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {images.map((image) => (
                    <label
                      key={image.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded cursor-pointer border-2 transition-all',
                        formData.imageIds.includes(image.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.imageIds.includes(image.id)}
                        onChange={(e) =>
                          toggleSelection('image', image.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {image.originalName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 비디오 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  비디오 선택
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {videos.map((video) => (
                    <label
                      key={video.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded cursor-pointer border-2 transition-all',
                        formData.videoIds.includes(video.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.videoIds.includes(video.id)}
                        onChange={(e) =>
                          toggleSelection('video', video.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 flex-1">{video.userName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 키오스크 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  키오스크 선택
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {kiosks.map((kiosk) => (
                    <label
                      key={kiosk.id}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded cursor-pointer border-2 transition-all',
                        formData.kioskIds.includes(kiosk.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.kioskIds.includes(kiosk.id)}
                        onChange={(e) =>
                          toggleSelection('kiosk', kiosk.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 flex-1">{kiosk.name}</span>
                    </label>
                  ))}
                </div>
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

