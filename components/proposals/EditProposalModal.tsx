'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Proposal, proposalsApi } from '@/lib/api/proposals';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';

interface Project {
  id: string;
  name: string;
}

interface EditProposalModalProps {
  proposal: Proposal;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProposalModal({
  proposal,
  onClose,
  onSuccess,
}: EditProposalModalProps) {
  const [formData, setFormData] = useState({
    name: proposal.name,
    message: proposal.message,
    projectId: proposal.projectId,
    duration: proposal.duration.toString(),
    displayStart: proposal.displayStart.split('T')[0] + 'T' + (proposal.displayStart.split('T')[1] || '00:00'),
    displayEnd: proposal.displayEnd.split('T')[0] + 'T' + (proposal.displayEnd.split('T')[1] || '00:00'),
    status: proposal.status,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    proposal.image
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${proposal.image}`
      : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
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
      setIsLoadingProjects(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    try {
      setIsSubmitting(true);

      // Convert image to base64 if new image is selected
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

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        message: formData.message,
        projectId: formData.projectId,
        duration: parseInt(formData.duration),
        displayStart: new Date(formData.displayStart).toISOString(),
        displayEnd: new Date(formData.displayEnd).toISOString(),
        status: formData.status,
      };

      if (imageBase64) {
        updateData.image = imageBase64;
      }

      await proposalsApi.update(proposal.id, updateData);
      showSuccess('프로포즈가 수정되었습니다.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update proposal:', error);
      showError(error.response?.data?.message || '프로포즈 수정에 실패했습니다.');
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
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>프로포즈 수정</DialogTitle>
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
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  프로젝트 *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  disabled={isLoadingProjects}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">프로젝트 선택</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  기간 (개월) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, displayStart: e.target.value })}
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
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <i className="fas fa-times mr-2"></i>제거
                  </Button>
                </div>
              ) : null}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                이미지 파일만 업로드 가능합니다. (최대 10MB)
              </p>
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
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

