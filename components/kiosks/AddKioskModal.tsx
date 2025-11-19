'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { ProjectSelect } from '@/components/projects/ProjectSelect';

interface AddKioskModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddKioskModal({ onClose, onSuccess }: AddKioskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ipAddress: '',
    projectId: '',
    macAddress: '',
    serialNumber: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToastStore();

  // IP 주소 마스킹 함수
  const formatIPAddress = (value: string): string => {
    // 숫자와 점만 허용
    const cleaned = value.replace(/[^\d.]/g, '');
    
    // 연속된 점 제거
    const noDoubleDots = cleaned.replace(/\.{2,}/g, '.');
    
    // 점으로 분리
    const parts = noDoubleDots.split('.');
    
    // 각 부분을 처리
    const formattedParts = parts.map((part, index) => {
      // 마지막 부분이 아니고 빈 문자열이면 점 추가하지 않음
      if (index < parts.length - 1 && part === '') {
        return '';
      }
      
      // 숫자만 추출
      const numbers = part.replace(/\D/g, '');
      
      // 3자리 초과 시 제한
      if (numbers.length > 3) {
        return numbers.slice(0, 3);
      }
      
      // 255 초과 시 제한
      const num = parseInt(numbers, 10);
      if (!isNaN(num) && num > 255) {
        return '255';
      }
      
      return numbers;
    });
    
    // 최대 4개 옥텟으로 제한
    const limitedParts = formattedParts.slice(0, 4);
    
    // 점으로 조인
    return limitedParts.join('.');
  };

  const handleIPAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIPAddress(e.target.value);
    setFormData({ ...formData, ipAddress: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IP 주소 형식 검사
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(formData.ipAddress)) {
      showError('올바른 IP 주소 형식을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/kiosks', {
        name: formData.name,
        location: formData.location,
        ipAddress: formData.ipAddress,
        projectId: formData.projectId || undefined,
        macAddress: formData.macAddress || undefined,
        serialNumber: formData.serialNumber || undefined,
        description: formData.description || undefined,
      });

      showSuccess('새 키오스크가 추가되었습니다.');
      onSuccess();
    } catch (error: any) {
      showError(error.response?.data?.message || '키오스크 추가에 실패했습니다.');
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
            <DialogTitle>새 키오스크 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                키오스크 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 키오스크 #13"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                위치 *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="예: 대구점 - 1층 로비"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                IP 주소 *
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.ipAddress}
                onChange={handleIPAddressChange}
                placeholder="예: 192.168.4.113"
                required
                className="w-full"
                maxLength={15} // 최대 길이: 255.255.255.255
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                프로젝트 *
              </label>
              <ProjectSelect
                value={formData.projectId}
                onChange={(value) => setFormData({ ...formData, projectId: value })}
                placeholder="프로젝트 선택"
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
                placeholder="키오스크에 대한 추가 설명"
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
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

