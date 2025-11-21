'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { useToastStore } from '@/lib/store/toastStore';
import { AnimalModal } from '@/components/content/AnimalModal';
import { Animal } from '@/lib/api/animals';
import { cn } from '@/lib/utils/cn';
import { getResourceThumbnailUrl } from '@/lib/utils/thumbnail';

export default function AnimalsManagementPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useToastStore();

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/animals');
      // HATEOAS 응답 구조 처리
      const responseData = response.data?.data || response.data;
      const animalsArray = Array.isArray(responseData) ? responseData : [];
      
      // API 응답 형식을 프론트엔드 형식으로 변환
      const formattedAnimals = animalsArray.map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        nameEn: animal.nameEn || animal.name_en,
        description: animal.description,
        characteristics: animal.characteristics,
        themes: animal.themes || [],
        thumbnailUrl: animal.thumbnailUrl || animal.thumbnail_url,
        loveFileUrl: animal.loveFileUrl || animal.love_file_url,
        healthFileUrl: animal.healthFileUrl || animal.health_file_url,
        wealthFileUrl: animal.wealthFileUrl || animal.wealth_file_url,
        isActive: animal.isActive !== undefined ? animal.isActive : animal.is_active !== undefined ? animal.is_active : true,
        createdAt: animal.createdAt || animal.created_at,
        updatedAt: animal.updatedAt || animal.updated_at,
      }));
      
      setAnimals(formattedAnimals);
    } catch (error: any) {
      showError('동물 목록을 불러오는데 실패했습니다.');
      setAnimals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 동물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(`/animals/${id}`);
      showSuccess('동물이 삭제되었습니다.');
      loadAnimals();
    } catch (error: any) {
      showError(error.response?.data?.message || '동물 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const animal = animals.find((a) => a.id === id);
      if (!animal) return;

      await apiClient.patch(`/animals/${id}`, {
        isActive: !currentStatus,
      });
      showSuccess(`동물이 ${currentStatus ? '비활성화' : '활성화'}되었습니다.`);
      loadAnimals();
    } catch (error: any) {
      showError(error.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAnimal(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAnimal(null);
  };

  const filteredAnimals = animals.filter((animal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      animal.name.toLowerCase().includes(searchLower) ||
      (animal.nameEn && animal.nameEn.toLowerCase().includes(searchLower)) ||
      (animal.description && animal.description.toLowerCase().includes(searchLower)) ||
      (animal.characteristics && animal.characteristics.toLowerCase().includes(searchLower))
    );
  });

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  <i className="fas fa-paw mr-2 text-purple-600"></i>
                  동물 관리
                </h1>
                <p className="text-gray-600">수호동물을 관리합니다.</p>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                동물 추가
              </Button>
            </div>

            {/* 검색 */}
            <div className="max-w-md">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <Input
                  type="text"
                  placeholder="동물 이름, 설명, 특성으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* 동물 그리드 */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : filteredAnimals.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '동물이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* 썸네일 */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {(() => {
                      const thumbnailUrl = getResourceThumbnailUrl(animal.id, 'animal', animal.thumbnailUrl);
                      return thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-paw text-gray-400 text-4xl"></i>
                        </div>
                      );
                    })()}
                    <div
                      className={cn(
                        'absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold',
                        animal.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      )}
                    >
                      {animal.isActive ? '활성' : '비활성'}
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {animal.name}
                    </h3>
                    {animal.nameEn && (
                      <p className="text-sm text-gray-500 mb-2">{animal.nameEn}</p>
                    )}
                    {animal.characteristics && (
                      <p className="text-sm text-gray-600 mb-2">
                        {animal.characteristics}
                      </p>
                    )}
                    {animal.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {animal.description}
                      </p>
                    )}
                    {animal.themes && animal.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {animal.themes.map((theme) => (
                          <span
                            key={theme}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {theme === 'love' ? '사랑하길' : theme === 'health' ? '건강하길' : '부자되길'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(animal)}
                      className="flex-1"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(animal.id, animal.isActive)}
                      className={cn(
                        animal.isActive
                          ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      )}
                    >
                      <i className={cn('mr-1', animal.isActive ? 'fas fa-eye-slash' : 'fas fa-eye')}></i>
                      {animal.isActive ? '비활성' : '활성'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(animal.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 동물 생성/수정 모달 */}
      <AnimalModal
        open={showModal}
        onClose={handleModalClose}
        onSuccess={() => {
          loadAnimals();
        }}
        animal={editingAnimal}
      />
    </>
  );
}

