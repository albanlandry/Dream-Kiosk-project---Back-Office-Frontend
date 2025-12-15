'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Proposal, proposalsApi } from '@/lib/api/proposals';
import { projectsApi, type Project as ApiProject } from '@/lib/api/projects';
import { useToastStore } from '@/lib/store/toastStore';
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select';

interface CreateProposalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProposalModal({
  open,
  onClose,
  onSuccess,
}: CreateProposalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    projectId: '',
    duration: '1',
    displayStart: '',
    displayEnd: '',
    status: 'enabled' as 'enabled' | 'disabled',
  });
  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastStore();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        message: '',
        projectId: '',
        duration: '1',
        displayStart: '',
        displayEnd: '',
        status: 'enabled',
      });
      setImageFile(null);
      setImagePreview(null);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  // Load projects with pagination and search
  const loadProjects = useCallback(async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      setIsLoadingProjects(true);
      const result = await projectsApi.getAllPaginated({
        page,
        limit: 20,
        search: search || undefined,
        fields: 'id,name,location',
      });

      const newOptions: SearchableSelectOption[] = result.data.map((p: ApiProject) => ({
        id: p.id,
        label: p.name,
        value: p.id,
      }));

      if (append) {
        setProjectOptions((prev) => [...prev, ...newOptions]);
      } else {
        setProjectOptions(newOptions);
      }

      setHasMoreProjects(result.pagination.hasMore);
    } catch (error: unknown) {
      console.error('Failed to load projects:', error);
      showError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [showError]);

  // Initial load
  useEffect(() => {
    if (open) {
      loadProjects(1, '', false);
    }
  }, [open, loadProjects]);

  // Handle project search
  const handleProjectSearch = useCallback((searchTerm: string) => {
    setProjectSearchTerm(searchTerm);
    setProjectPage(1);
    loadProjects(1, searchTerm, false);
  }, [loadProjects]);

  // Handle load more projects
  const handleLoadMoreProjects = useCallback(() => {
    if (!isLoadingProjects && hasMoreProjects) {
      const nextPage = projectPage + 1;
      setProjectPage(nextPage);
      loadProjects(nextPage, projectSearchTerm, true);
    }
  }, [isLoadingProjects, hasMoreProjects, projectPage, projectSearchTerm, loadProjects]);

  // Calculate end date based on duration
  const handleDurationChange = (duration: string) => {
    setFormData({ ...formData, duration });
    if (formData.displayStart) {
      const startDate = new Date(formData.displayStart);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(duration));
      setFormData({
        ...formData,
        duration,
        displayEnd: endDate.toISOString().slice(0, 16),
      });
    }
  };

  // Calculate end date when start date changes
  const handleStartDateChange = (displayStart: string) => {
    setFormData({ ...formData, displayStart });
    if (displayStart && formData.duration) {
      const startDate = new Date(displayStart);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(formData.duration));
      setFormData({
        ...formData,
        displayStart,
        displayEnd: endDate.toISOString().slice(0, 16),
      });
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.message || !formData.projectId || !formData.displayStart || !formData.displayEnd) {
      showError('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert image to base64 if image is selected
      let imageBase64: string | undefined;
      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Prepare create data
      const createData: any = {
        name: formData.name,
        message: formData.message,
        projectId: formData.projectId,
        duration: parseInt(formData.duration),
        displayStart: new Date(formData.displayStart).toISOString(),
        displayEnd: new Date(formData.displayEnd).toISOString(),
        status: formData.status,
      };

      if (imageBase64) {
        createData.image = imageBase64;
      }

      await proposalsApi.create(createData);
      showSuccess('프로포즈가 생성되었습니다.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create proposal:', error);
      showError(error.response?.data?.message || '프로포즈 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>새 프로포즈 생성</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={200}
                className="w-full"
                placeholder="프로포즈 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                메시지 *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
                maxLength={1000}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="프로포즈 메시지를 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  프로젝트 *
                </label>
                <SearchableSelect
                  options={projectOptions}
                  value={formData.projectId}
                  onChange={(value) => setFormData({ ...formData, projectId: value })}
                  placeholder="프로젝트 선택"
                  searchPlaceholder="프로젝트 검색..."
                  disabled={isLoadingProjects}
                  required
                  onSearch={handleProjectSearch}
                  onLoadMore={handleLoadMoreProjects}
                  hasMore={hasMoreProjects}
                  isLoading={isLoadingProjects}
                  emptyMessage="프로젝트가 없습니다."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  기간 (개월) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="1">1개월</option>
                  <option value="3">3개월</option>
                  <option value="6">6개월</option>
                  <option value="12">12개월</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  표시 시작 *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.displayStart}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  표시 종료 *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.displayEnd}
                  onChange={(e) => setFormData({ ...formData, displayEnd: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  상태 *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'enabled' | 'disabled' })
                  }
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="enabled">활성화</option>
                  <option value="disabled">비활성화</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이미지
              </label>
              {imagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <i className="fas fa-times mr-2"></i>제거
                  </Button>
                </div>
              ) : (
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center">
                    <i className={`fas fa-cloud-upload-alt text-4xl mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}></i>
                    <p className="text-sm text-gray-600 mb-2">
                      {isDragging ? '파일을 놓아주세요' : '이미지 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요'}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      이미지 파일만 업로드 가능합니다. (최대 10MB)
                    </p>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <i className="fas fa-folder-open mr-2"></i>파일 선택
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? '생성 중...' : '생성'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

