'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { cn } from '@/lib/utils/cn';

interface UploadContentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ContentType = 'image' | 'video' | null;

export function UploadContentModal({
  open,
  onClose,
  onSuccess,
}: UploadContentModalProps) {
  const [contentType, setContentType] = useState<ContentType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastStore();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // 파일 타입 확인
    if (selectedFile.type.startsWith('image/')) {
      setContentType('image');
      setFile(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      setContentType('video');
      setFile(selectedFile);
    } else {
      showError('이미지 또는 비디오 파일만 업로드할 수 있습니다.');
      return;
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !contentType) {
      showError('파일을 선택해주세요.');
      return;
    }

    setUploading(true);

    try {
      // 파일을 base64로 변환
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          if (contentType === 'image') {
            await apiClient.post('/images', {
              image: base64String,
              description: description || undefined,
            });
            showSuccess('이미지가 성공적으로 업로드되었습니다.');
          } else if (contentType === 'video') {
            // 비디오 업로드 API (백엔드 구현 필요)
            await apiClient.post('/videos/upload', {
              video: base64String,
              title: title || undefined,
              description: description || undefined,
            });
            showSuccess('비디오가 성공적으로 업로드되었습니다.');
          }

          // 폼 초기화
          setFile(null);
          setTitle('');
          setDescription('');
          setContentType(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          onClose();
          onSuccess?.();
        } catch (error: any) {
          showError(
            error.response?.data?.message ||
              `${contentType === 'image' ? '이미지' : '비디오'} 업로드에 실패했습니다.`,
          );
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        showError('파일 읽기에 실패했습니다.');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      showError('파일 처리 중 오류가 발생했습니다.');
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setTitle('');
      setDescription('');
      setContentType(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>콘텐츠 업로드</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* 파일 타입 선택 */}
          {!contentType && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                콘텐츠 타입 선택
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setContentType('image')}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <i className="fas fa-image text-3xl text-gray-400 mb-2 block"></i>
                  <span className="text-sm font-semibold text-gray-700">이미지</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('video')}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <i className="fas fa-video text-3xl text-gray-400 mb-2 block"></i>
                  <span className="text-sm font-semibold text-gray-700">비디오</span>
                </button>
              </div>
            </div>
          )}

          {/* 드래그 앤 드롭 영역 */}
          {contentType && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {contentType === 'image' ? '이미지' : '비디오'} 파일{' '}
                <span className="text-red-500">*</span>
              </label>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300',
                  file && 'border-green-500 bg-green-50',
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={contentType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <i
                      className={cn(
                        'text-4xl',
                        contentType === 'image'
                          ? 'fas fa-image text-green-500'
                          : 'fas fa-video text-green-500',
                      )}
                    ></i>
                    <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      파일 제거
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <i
                      className={cn(
                        'text-4xl text-gray-400',
                        contentType === 'image' ? 'fas fa-image' : 'fas fa-video',
                      )}
                    ></i>
                    <p className="text-sm text-gray-600">
                      파일을 드래그 앤 드롭하거나 클릭하여 선택
                    </p>
                    <p className="text-xs text-gray-500">
                      {contentType === 'image'
                        ? 'JPEG, PNG, GIF, WebP (최대 10MB)'
                        : 'MP4, WebM, MOV (최대 100MB)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 제목 (비디오만) */}
          {contentType === 'video' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                제목
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="비디오 제목을 입력하세요 (선택사항)"
                maxLength={200}
              />
            </div>
          )}

          {/* 설명 */}
          {contentType && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder={`${contentType === 'image' ? '이미지' : '비디오'}에 대한 설명을 입력하세요 (선택사항)`}
                maxLength={500}
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              취소
            </Button>
            {contentType && (
              <Button
                type="submit"
                disabled={uploading || !file}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                {uploading
                  ? `${contentType === 'image' ? '이미지' : '비디오'} 업로드 중...`
                  : '업로드'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

