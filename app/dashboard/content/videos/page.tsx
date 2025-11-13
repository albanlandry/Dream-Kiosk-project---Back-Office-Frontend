'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils/cn';

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
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      // Note: This endpoint may need to be created in the backend
      const response = await apiClient.get('/videos');
      setVideos(response.data || []);
    } catch (error: any) {
      showError('비디오 목록을 불러오는데 실패했습니다.');
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
      />
      <div className="p-8 min-h-screen">
        {/* 검색 */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="사용자 이름 또는 메시지로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
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
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-[200px_1fr_auto] gap-6">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-video text-gray-400 text-4xl"></i>
                      </div>
                    )}
                    {getStatusBadge(video.status)}
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
          </div>
        )}
      </div>
    </>
  );
}

