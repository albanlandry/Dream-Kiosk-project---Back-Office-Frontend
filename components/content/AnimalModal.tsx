'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Animal } from '@/lib/api/animals';

interface AnimalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  animal?: Animal | null; // If provided, edit mode; otherwise, create mode
}

export function AnimalModal({
  open,
  onClose,
  onSuccess,
  animal,
}: AnimalModalProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToastStore();

  const isEditMode = !!animal;

  useEffect(() => {
    if (animal) {
      setName(animal.name || '');
      setNameEn(animal.nameEn || '');
      setDescription(animal.description || '');
      setCharacteristics(animal.characteristics || '');
      setThemes(animal.themes || []);
      setThumbnailUrl(animal.thumbnailUrl || '');
      setIsActive(animal.isActive ?? true);
    } else {
      // Reset form for create mode
      setName('');
      setNameEn('');
      setDescription('');
      setCharacteristics('');
      setThemes([]);
      setThumbnailUrl('');
      setIsActive(true);
    }
  }, [animal, open]);

  const handleThemeChange = (theme: string, checked: boolean) => {
    if (checked) {
      setThemes([...themes, theme]);
    } else {
      setThemes(themes.filter((t) => t !== theme));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('동물 이름은 필수입니다.');
      return;
    }

    setSaving(true);

    try {
      const animalData = {
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        description: description.trim() || undefined,
        characteristics: characteristics.trim() || undefined,
        themes: themes.length > 0 ? themes : undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isActive,
      };

      if (isEditMode && animal) {
        await apiClient.patch(`/animals/${animal.id}`, animalData);
        showSuccess('동물 정보가 성공적으로 수정되었습니다.');
      } else {
        await apiClient.post('/animals', animalData);
        showSuccess('동물이 성공적으로 생성되었습니다.');
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      showError(
        error.response?.data?.message ||
          (isEditMode ? '동물 정보 수정에 실패했습니다.' : '동물 생성에 실패했습니다.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setNameEn('');
      setDescription('');
      setCharacteristics('');
      setThemes([]);
      setThumbnailUrl('');
      setIsActive(true);
      onClose();
    }
  };

  const availableThemes = ['love', 'health', 'wealth'];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '동물 수정' : '동물 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 (한글) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                동물 이름 (한글) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 호랑이"
                maxLength={100}
                className="w-full"
                required
              />
            </div>

            {/* 이름 (영문) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                동물 이름 (영문)
              </label>
              <Input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="예: tiger"
                maxLength={100}
                className="w-full"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="동물에 대한 설명을 입력하세요"
                maxLength={500}
              />
            </div>

            {/* 특성 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                특성
              </label>
              <Input
                type="text"
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
                placeholder="예: 용맹한 수호신"
                maxLength={200}
                className="w-full"
              />
            </div>

            {/* 테마 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                테마
              </label>
              <div className="flex gap-4">
                {availableThemes.map((theme) => (
                  <label
                    key={theme}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={themes.includes(theme)}
                      onChange={(e) => handleThemeChange(theme, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {theme === 'love' ? '사랑하길' : theme === 'health' ? '건강하길' : '부자되길'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 썸네일 URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                썸네일 이미지 URL
              </label>
              <Input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
              {thumbnailUrl && (
                <div className="mt-2">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* 활성화 여부 */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-800">활성화</span>
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={saving || !name.trim()}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                {saving ? (isEditMode ? '수정 중...' : '생성 중...') : (isEditMode ? '수정' : '생성')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

