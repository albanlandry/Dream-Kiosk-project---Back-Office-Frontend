'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


export function CreateScheduleModal({
  open,
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    authorName: '',
    wishMessage: '',
    displayStart: '',
    displayEnd: '',
    priority: 'normal',
    maxPlayCount: '1000',
  });

  const [projectOptions, setProjectOptions] = useState<SearchableSelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);

  const { showSuccess, showError } = useToastStore();

  // Load projects
  const loadProjects = useCallback(async (page: number = 1, search: string = '', append: boolean = false) => {
    try {
      setIsLoadingProjects(true);
      const response = await apiClient.get('/projects', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          fields: 'id,name,location',
        },
      });

      const projectsData = response.data?.data?.data || response.data?.data || response.data || [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];

      const newOptions: SearchableSelectOption[] = projectsList.map((project: any) => ({
        id: project.id,
        label: `${project.name}${project.location ? ` (${project.location})` : ''}`,
        value: project.id,
      }));

      if (append) {
        setProjectOptions((prev) => [...prev, ...newOptions]);
      } else {
        setProjectOptions(newOptions);
      }

      const pagination = response.data?.data?.pagination || response.data?.pagination;
      setHasMoreProjects(pagination?.hasMore || false);
    } catch (error) {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      showError('제목을 입력해주세요.');
      return;
    }

    if (!formData.projectId) {
      showError('프로젝트를 선택해주세요.');
      return;
    }

    if (!formData.displayStart) {
      showError('시작 시간을 입력해주세요.');
      return;
    }

    if (!formData.displayEnd) {
      showError('종료 시간을 입력해주세요.');
      return;
    }

    if (formData.authorName && formData.authorName.length > 10) {
      showError('작성자 이름은 10자 이하여야 합니다.');
      return;
    }

    if (formData.wishMessage && formData.wishMessage.length > 20) {
      showError('소원 메시지는 20자 이하여야 합니다.');
      return;
    }

    // Convert priority text to number
    const priorityMap: Record<string, number> = {
      'high': 3,
      'normal': 2,
      'low': 1,
    };

    try {
      setIsSubmitting(true);

      const payload: any = {
        title: formData.title,
        projectId: formData.projectId,
        displayStart: new Date(formData.displayStart).toISOString(),
        displayEnd: new Date(formData.displayEnd).toISOString(),
        priority: priorityMap[formData.priority] || 2,
        maxPlayCount: parseInt(formData.maxPlayCount, 10) || 1000,
      };

      if (formData.authorName) payload.authorName = formData.authorName;
      if (formData.wishMessage) payload.wishMessage = formData.wishMessage;

      await apiClient.post('/schedules', payload);

      showSuccess('스케줄이 생성되었습니다.');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      showError(error.response?.data?.message || '스케줄 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        projectId: '',
        authorName: '',
        wishMessage: '',
        displayStart: '',
        displayEnd: '',
        priority: 'normal',
        maxPlayCount: '1000',
      });
      setProjectSearchTerm('');
      setProjectPage(1);
      onClose();
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>새 스케줄 생성</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 용의 꿈 - 김철수"
                required
                className="w-full"
              />
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                작성자 (선택사항, 최대 10자)
              </label>
              <Input
                type="text"
                value={formData.authorName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 10) {
                    setFormData({ ...formData, authorName: value });
                  }
                }}
                placeholder="작성자 이름 (최대 10글자)"
                maxLength={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.authorName.length}/10
              </p>
            </div>

            {/* Wish Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                소원 메시지 (선택사항, 최대 20자)
              </label>
              <textarea
                value={formData.wishMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 20) {
                    setFormData({ ...formData, wishMessage: value });
                  }
                }}
                placeholder="소원 메시지를 입력하세요 (최대 20글자)"
                maxLength={20}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.wishMessage.length}/20
              </p>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={projectOptions}
                value={formData.projectId}
                onChange={(value) => setFormData({ ...formData, projectId: value })}
                placeholder="프로젝트 선택"
                searchPlaceholder="프로젝트 검색..."
                isLoading={isLoadingProjects}
                emptyMessage="프로젝트가 없습니다."
                onSearch={handleProjectSearch}
                onLoadMore={hasMoreProjects ? handleLoadMoreProjects : undefined}
                hasMore={hasMoreProjects}
              />
            </div>

            {/* Display Start */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={formData.displayStart}
                  onChange={(e) => setFormData({ ...formData, displayStart: e.target.value })}
                  required
                  className="w-full pr-10"
                />
                <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            {/* Display End */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={formData.displayEnd}
                  onChange={(e) => setFormData({ ...formData, displayEnd: e.target.value })}
                  required
                  className="w-full pr-10"
                />
                <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                우선순위
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
              </select>
            </div>

            {/* Max Play Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                최대 재생 횟수
              </label>
              <Input
                type="number"
                value={formData.maxPlayCount}
                onChange={(e) => setFormData({ ...formData, maxPlayCount: e.target.value })}
                placeholder="1000"
                min="1"
                className="w-full"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-lg"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

