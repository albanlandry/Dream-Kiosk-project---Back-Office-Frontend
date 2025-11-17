'use client';

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { Animal } from '@/lib/api/animals';
import { cn } from '@/lib/utils/cn';

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

  // Theme file states
  const [loveFile, setLoveFile] = useState<File | null>(null);
  const [healthFile, setHealthFile] = useState<File | null>(null);
  const [wealthFile, setWealthFile] = useState<File | null>(null);
  const [loveFilePreview, setLoveFilePreview] = useState<string | null>(null);
  const [healthFilePreview, setHealthFilePreview] = useState<string | null>(null);
  const [wealthFilePreview, setWealthFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({});

  // File input refs
  const loveFileInputRef = useRef<HTMLInputElement>(null);
  const healthFileInputRef = useRef<HTMLInputElement>(null);
  const wealthFileInputRef = useRef<HTMLInputElement>(null);

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
      // Note: In edit mode, we don't preload files, user needs to re-upload if they want to change
      setLoveFile(null);
      setHealthFile(null);
      setWealthFile(null);
      setLoveFilePreview(null);
      setHealthFilePreview(null);
      setWealthFilePreview(null);
    } else {
      // Reset form for create mode
      setName('');
      setNameEn('');
      setDescription('');
      setCharacteristics('');
      setThemes([]);
      setThumbnailUrl('');
      setIsActive(true);
      setLoveFile(null);
      setHealthFile(null);
      setWealthFile(null);
      setLoveFilePreview(null);
      setHealthFilePreview(null);
      setWealthFilePreview(null);
    }
  }, [animal, open]);

  const handleFileSelect = (
    file: File,
    theme: 'love' | 'health' | 'wealth',
  ) => {
    // Check if file is video or image
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      showError('비디오 또는 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      showError('파일 크기는 최대 100MB까지 가능합니다.');
      return;
    }

    // Set file
    if (theme === 'love') {
      setLoveFile(file);
      createPreview(file, setLoveFilePreview);
    } else if (theme === 'health') {
      setHealthFile(file);
      createPreview(file, setHealthFilePreview);
    } else if (theme === 'wealth') {
      setWealthFile(file);
      createPreview(file, setWealthFilePreview);
    }

    // Auto-add theme to themes array
    if (!themes.includes(theme)) {
      setThemes([...themes, theme]);
    }
  };

  const createPreview = (file: File, setPreview: (preview: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (
    e: DragEvent<HTMLDivElement>,
    theme: 'love' | 'health' | 'wealth',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ ...isDragging, [theme]: true });
  };

  const handleDragLeave = (
    e: DragEvent<HTMLDivElement>,
    theme: 'love' | 'health' | 'wealth',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ ...isDragging, [theme]: false });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    theme: 'love' | 'health' | 'wealth',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging({ ...isDragging, [theme]: false });

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile, theme);
    }
  };

  const handleFileInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    theme: 'love' | 'health' | 'wealth',
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile, theme);
    }
  };

  const removeFile = (theme: 'love' | 'health' | 'wealth') => {
    if (theme === 'love') {
      setLoveFile(null);
      setLoveFilePreview(null);
      if (loveFileInputRef.current) {
        loveFileInputRef.current.value = '';
      }
    } else if (theme === 'health') {
      setHealthFile(null);
      setHealthFilePreview(null);
      if (healthFileInputRef.current) {
        healthFileInputRef.current.value = '';
      }
    } else if (theme === 'wealth') {
      setWealthFile(null);
      setWealthFilePreview(null);
      if (wealthFileInputRef.current) {
        wealthFileInputRef.current.value = '';
      }
    }
    // Remove theme from themes array if no file
    setThemes(themes.filter((t) => t !== theme));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('동물 이름은 필수입니다.');
      return;
    }

    // Validate that at least one theme file is provided (for create mode)
    if (!isEditMode && !loveFile && !healthFile && !wealthFile) {
      showError('최소 하나의 테마 파일(사랑하길, 건강하길, 부자되길)을 업로드해야 합니다.');
      return;
    }

    setSaving(true);

    try {
      // Convert files to base64
      const loveFileBase64 = loveFile ? await fileToBase64(loveFile) : undefined;
      const healthFileBase64 = healthFile ? await fileToBase64(healthFile) : undefined;
      const wealthFileBase64 = wealthFile ? await fileToBase64(wealthFile) : undefined;

      const animalData: any = {
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        description: description.trim() || undefined,
        characteristics: characteristics.trim() || undefined,
        themes: themes.length > 0 ? themes : undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isActive,
      };

      // Add theme files if provided
      if (loveFileBase64) {
        animalData.loveFile = loveFileBase64;
      }
      if (healthFileBase64) {
        animalData.healthFile = healthFileBase64;
      }
      if (wealthFileBase64) {
        animalData.wealthFile = wealthFileBase64;
      }

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
      setLoveFile(null);
      setHealthFile(null);
      setWealthFile(null);
      setLoveFilePreview(null);
      setHealthFilePreview(null);
      setWealthFilePreview(null);
      setIsDragging({});
      if (loveFileInputRef.current) loveFileInputRef.current.value = '';
      if (healthFileInputRef.current) healthFileInputRef.current.value = '';
      if (wealthFileInputRef.current) wealthFileInputRef.current.value = '';
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

            {/* 테마 파일 업로드 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                테마 파일 <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (최소 하나의 테마 파일이 필요합니다)
                </span>
              </label>
              <div className="space-y-4">
                {/* 사랑하길 테마 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사랑하길 테마
                  </label>
                  <div
                    onDragEnter={(e) => handleDragEnter(e, 'love')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'love')}
                    onDrop={(e) => handleDrop(e, 'love')}
                    onClick={() => loveFileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer',
                      isDragging.love
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300',
                      loveFile && 'border-green-500 bg-green-50',
                    )}
                  >
                    <input
                      ref={loveFileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={(e) => handleFileInputChange(e, 'love')}
                      className="hidden"
                    />
                    {loveFile ? (
                      <div className="space-y-2">
                        {loveFilePreview && (
                          <div className="flex justify-center">
                            {loveFile.type.startsWith('video/') ? (
                              <video
                                src={loveFilePreview}
                                className="max-w-full max-h-32 rounded"
                                controls
                              />
                            ) : (
                              <img
                                src={loveFilePreview}
                                alt="Preview"
                                className="max-w-full max-h-32 rounded object-cover"
                              />
                            )}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-700">{loveFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(loveFile.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('love');
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          파일 제거
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <i className="fas fa-file-upload text-3xl text-gray-400"></i>
                        <p className="text-sm text-gray-600">
                          파일을 드래그 앤 드롭하거나 클릭하여 선택
                        </p>
                        <p className="text-xs text-gray-500">
                          비디오 또는 이미지 (최대 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 건강하길 테마 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    건강하길 테마
                  </label>
                  <div
                    onDragEnter={(e) => handleDragEnter(e, 'health')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'health')}
                    onDrop={(e) => handleDrop(e, 'health')}
                    onClick={() => healthFileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer',
                      isDragging.health
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300',
                      healthFile && 'border-green-500 bg-green-50',
                    )}
                  >
                    <input
                      ref={healthFileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={(e) => handleFileInputChange(e, 'health')}
                      className="hidden"
                    />
                    {healthFile ? (
                      <div className="space-y-2">
                        {healthFilePreview && (
                          <div className="flex justify-center">
                            {healthFile.type.startsWith('video/') ? (
                              <video
                                src={healthFilePreview}
                                className="max-w-full max-h-32 rounded"
                                controls
                              />
                            ) : (
                              <img
                                src={healthFilePreview}
                                alt="Preview"
                                className="max-w-full max-h-32 rounded object-cover"
                              />
                            )}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-700">{healthFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(healthFile.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('health');
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          파일 제거
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <i className="fas fa-file-upload text-3xl text-gray-400"></i>
                        <p className="text-sm text-gray-600">
                          파일을 드래그 앤 드롭하거나 클릭하여 선택
                        </p>
                        <p className="text-xs text-gray-500">
                          비디오 또는 이미지 (최대 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 부자되길 테마 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    부자되길 테마
                  </label>
                  <div
                    onDragEnter={(e) => handleDragEnter(e, 'wealth')}
                    onDragOver={handleDragOver}
                    onDragLeave={(e) => handleDragLeave(e, 'wealth')}
                    onDrop={(e) => handleDrop(e, 'wealth')}
                    onClick={() => wealthFileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer',
                      isDragging.wealth
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300',
                      wealthFile && 'border-green-500 bg-green-50',
                    )}
                  >
                    <input
                      ref={wealthFileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={(e) => handleFileInputChange(e, 'wealth')}
                      className="hidden"
                    />
                    {wealthFile ? (
                      <div className="space-y-2">
                        {wealthFilePreview && (
                          <div className="flex justify-center">
                            {wealthFile.type.startsWith('video/') ? (
                              <video
                                src={wealthFilePreview}
                                className="max-w-full max-h-32 rounded"
                                controls
                              />
                            ) : (
                              <img
                                src={wealthFilePreview}
                                alt="Preview"
                                className="max-w-full max-h-32 rounded object-cover"
                              />
                            )}
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-700">{wealthFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(wealthFile.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile('wealth');
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          파일 제거
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <i className="fas fa-file-upload text-3xl text-gray-400"></i>
                        <p className="text-sm text-gray-600">
                          파일을 드래그 앤 드롭하거나 클릭하여 선택
                        </p>
                        <p className="text-xs text-gray-500">
                          비디오 또는 이미지 (최대 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
                disabled={
                  saving ||
                  !name.trim() ||
                  (!isEditMode && !loveFile && !healthFile && !wealthFile)
                }
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

