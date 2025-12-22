'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export interface ContentItem {
  id: string;
  title: string;
  template: string;
  author: string;
  wish: string;
  createdAt: string;
  displayPeriod: string;
  status: 'active' | 'expired' | 'pending';
  playCount?: number;
  downloadCount?: number;
  fileSize?: string;
  videoUrl?: string;
}

interface ContentPreviewModalProps {
  content: ContentItem | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (content: ContentItem) => void;
}

export function ContentPreviewModal({ content, open, onClose, onDownload }: ContentPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!content) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(content);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      
      return `${year}. ${month}. ${day}. ${period} ${String(displayHours).padStart(2, '0')}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader className="sr-only">
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>콘텐츠 미리보기</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* 비디오 플레이어 */}
          <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
            {content.videoUrl ? (
              <video
                src={content.videoUrl}
                className="w-full h-full"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="mb-4 w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className={`fas fa-${isPlaying ? 'pause' : 'play'} text-white text-2xl ml-1`}></i>
                  </button>
                  <div className="text-white/70 text-sm">0:00</div>
                </div>
                {/* 비디오 컨트롤 UI */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center gap-4">
                      <span>0:00</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="hover:opacity-70">
                        <i className="fas fa-volume-up"></i>
                      </button>
                      <button className="hover:opacity-70">
                        <i className="fas fa-expand"></i>
                      </button>
                      <button className="hover:opacity-70">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-white/20 rounded-full">
                    <div className="h-full bg-white/50 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>

          {/* 콘텐츠 정보 - 2 컬럼 */}
          <div className="grid grid-cols-2 gap-8">
            {/* 왼쪽 컬럼 */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">템플릿</p>
                <p className="text-base text-gray-900">{content.template}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">소원 메시지</p>
                <p className="text-base text-gray-900">{content.wish}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">노출 기간</p>
                <p className="text-base text-gray-900">{content.displayPeriod}</p>
              </div>
            </div>

            {/* 오른쪽 컬럼 */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">작성자</p>
                <p className="text-base text-gray-900">{content.author}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">생성일</p>
                <p className="text-base text-gray-900">{formatDate(content.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">상태</p>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${
                    content.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : content.status === 'expired'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {content.status === 'active' ? '활성' : content.status === 'expired' ? '만료' : '대기중'}
                </span>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* 재생 횟수 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-play text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {content.playCount?.toLocaleString() || '1,234'}
                </p>
                <p className="text-sm text-gray-500">재생 횟수</p>
              </div>
            </div>

            {/* 다운로드 횟수 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-download text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {content.downloadCount?.toLocaleString() || '89'}
                </p>
                <p className="text-sm text-gray-500">다운로드 횟수</p>
              </div>
            </div>

            {/* 파일 크기 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-file-download text-blue-600 text-xl"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {content.fileSize || '15.2 MB'}
                </p>
                <p className="text-sm text-gray-500">파일 크기</p>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <i className="fas fa-download mr-2"></i>
              다운로드
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300"
            >
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

