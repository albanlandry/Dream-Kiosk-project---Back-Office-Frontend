'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Project {
  id: string;
  name: string;
}

// 템플릿 목록 (나중에 API로 대체 가능)
const TEMPLATES = [
  { id: 'dragon', name: '용 (Dragon)', videoId: '' }, // 실제 videoId는 백엔드에서 매핑 필요
  { id: 'tiger', name: '호랑이 (Tiger)', videoId: '' },
  { id: 'phoenix', name: '봉황 (Phoenix)', videoId: '' },
  { id: 'turtle', name: '거북이 (Turtle)', videoId: '' },
];

// 노출 기간 옵션
const DISPLAY_PERIODS = [
  { value: '1', label: '1일' },
  { value: '3', label: '3일' },
  { value: '7', label: '7일' },
  { value: '14', label: '14일' },
  { value: '30', label: '30일' },
];

export function CreateContentModal({
  open,
  onClose,
  onSuccess,
}: CreateContentModalProps) {
  const [formData, setFormData] = useState({
    templateId: '',
    author: '',
    wishMessage: '',
    displayPeriod: '',
    projectId: '',
    image: null as File | null,
    memo: '',
    autoGenerate: false,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await apiClient.get('/projects');
      const responseData = response.data?.data || response.data;
      const projectsList = Array.isArray(responseData) ? responseData : [];
      setProjects(
        projectsList.map((p: any) => ({
          id: p.id,
          name: p.name,
        })),
      );
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      showError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean | File | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleInputChange('image', file);
      } else {
        showError('이미지 파일만 업로드할 수 있습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.templateId) {
      showError('템플릿을 선택해주세요.');
      return;
    }
    if (!formData.author.trim()) {
      showError('작성자 이름을 입력해주세요.');
      return;
    }
    if (formData.author.length > 10) {
      showError('작성자 이름은 최대 10글자까지 입력할 수 있습니다.');
      return;
    }
    if (!formData.wishMessage.trim()) {
      showError('소원 메시지를 입력해주세요.');
      return;
    }
    if (formData.wishMessage.length > 20) {
      showError('소원 메시지는 최대 20글자까지 입력할 수 있습니다.');
      return;
    }
    if (!formData.displayPeriod) {
      showError('노출 기간을 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이미지가 있으면 먼저 업로드
      let userPicture = '';
      if (formData.image) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.image!);
        });
        userPicture = await base64Promise;
      }

      // 템플릿에서 videoId 가져오기 (실제로는 백엔드에서 매핑 필요)
      const selectedTemplate = TEMPLATES.find((t) => t.id === formData.templateId);
      if (!selectedTemplate) {
        throw new Error('선택한 템플릿을 찾을 수 없습니다.');
      }

      // 비디오 생성 API 호출
      const videoData = {
        backgroundVideoId: selectedTemplate.videoId || formData.templateId, // 임시로 templateId 사용
        userPicture: userPicture || '', // 선택사항이지만 API는 필수로 요구할 수 있음
        userName: formData.author,
        userMessage: formData.wishMessage,
      };

      const videoResponse = await apiClient.post('/videos/merge', videoData);
      const videoId = videoResponse.data?.data?.video_id || videoResponse.data?.video_id;

      // TODO: 콘텐츠 메타데이터 저장 (노출 기간, 프로젝트, 메모 등)
      // 별도의 콘텐츠 API가 필요할 수 있음

      showSuccess('콘텐츠가 성공적으로 생성되었습니다.');
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Content creation error:', error);
      showError(
        error.response?.data?.message ||
          error.message ||
          '콘텐츠 생성에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        templateId: '',
        author: '',
        wishMessage: '',
        displayPeriod: '',
        projectId: '',
        image: null,
        memo: '',
        autoGenerate: false,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <DialogContent className="min-w-lg max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>새 콘텐츠 생성</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 템플릿 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                템플릿 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleInputChange('templateId', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">템플릿 선택</option>
                {TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 작성자 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                작성자 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="작성자 이름 (최대 10글자)"
                maxLength={10}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.author.length}/10 글자
              </p>
            </div>

            {/* 소원 메시지 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                소원 메시지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.wishMessage}
                onChange={(e) => handleInputChange('wishMessage', e.target.value)}
                rows={3}
                placeholder="소원 메시지를 입력하세요 (최대 20글자)"
                maxLength={20}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.wishMessage.length}/20 글자
              </p>
            </div>

            {/* 노출 기간 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                노출 기간 (일) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.displayPeriod}
                onChange={(e) => handleInputChange('displayPeriod', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">기간 선택</option>
                {DISPLAY_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 프로젝트 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                disabled={loadingProjects}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">프로젝트 선택</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이미지 업로드
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.image && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <span>{formData.image.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('image', null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  선택사항: 개인 이미지를 업로드하여 콘텐츠에 포함할 수 있습니다.
                </p>
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                메모
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                rows={3}
                placeholder="콘텐츠에 대한 메모"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 자동 생성 체크박스 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoGenerate"
                checked={formData.autoGenerate}
                onChange={(e) => handleInputChange('autoGenerate', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="autoGenerate"
                className="text-sm text-gray-700 cursor-pointer"
              >
                자동 생성 (AI가 소원 메시지에 맞는 영상을 자동 생성)
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                {loading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

