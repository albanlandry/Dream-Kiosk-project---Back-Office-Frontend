'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';

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
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/images?active_only=false');
      // HATEOAS 응답 구조: { data: { images: [...], total_count: ... }, _links: {...} }
      const responseData = response.data?.data || response.data;
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
    } catch (error: any) {
      showError('이미지 목록을 불러오는데 실패했습니다.');
      setImages([]); // 에러 시 빈 배열로 설정
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    const description = formData.get('description') as string;

    if (!file) {
      showError('파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          await apiClient.post('/images', {
            image: base64String,
            description: description || undefined,
          });

          showSuccess('이미지가 성공적으로 업로드되었습니다.');
          setShowUploadModal(false);
          loadImages();
        } catch (error: any) {
          showError(error.response?.data?.message || '이미지 업로드에 실패했습니다.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showError('파일 읽기에 실패했습니다.');
      setUploading(false);
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

  const filteredImages = images.filter((image) =>
    image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* 검색 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="이미지 이름 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* 이미지 그리드 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {image.thumbnailPath ? (
                    <img
                      src={`http://localhost:3000${image.thumbnailPath}`}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-image text-gray-400 text-4xl"></i>
                    </div>
                  )}
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
        )}
      </div>

      {/* 업로드 모달 */}
      {showUploadModal && (
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>이미지 업로드</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  이미지 파일 *
                </label>
                <Input type="file" accept="image/*" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  설명
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="이미지에 대한 설명을 입력하세요."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                >
                  {uploading ? '업로드 중...' : '업로드'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

