'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { getResourceThumbnailUrl } from '@/lib/utils/thumbnail';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  images: Array<{ id: string; originalName: string; thumbnailPath?: string }>;
  videos: Array<{ id: string; userName: string; thumbnailUrl?: string }>;
  animals: Array<{ id: string; name: string; thumbnailUrl?: string }>;
  kiosks: Array<{ id: string; name: string }>;
  createdAt: Date;
  updatedAt: Date;
}

interface ResourceListProps {
  resources: Resource[];
  selectedResource: Resource | null;
  isLoading: boolean;
  onSelectResource: (resource: Resource) => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  onViewMedia: (resource: Resource) => void;
}

export function ResourceList({
  resources,
  selectedResource,
  isLoading,
  onSelectResource,
  onEditResource,
  onDeleteResource,
  onViewMedia,
}: ResourceListProps) {
  const getResourceMedia = (resource: Resource) => {
    return {
      images: resource.images || [],
      videos: resource.videos || [],
      animals: resource.animals || [],
    };
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">리소스 목록</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">리소스가 없습니다.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {resources.map((resource) => {
              const media = getResourceMedia(resource);
              return (
                <div
                  key={resource.id}
                  className={cn(
                    'p-4 rounded-lg border-2 cursor-pointer transition-all',
                    selectedResource?.id === resource.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => onSelectResource(resource)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditResource(resource);
                        }}
                        className="h-7 px-2"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteResource(resource.id);
                        }}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </Button>
                    </div>
                  </div>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500 mb-2">
                    <span>
                      <i className="fas fa-image mr-1"></i>
                      {media.images.length}개
                    </span>
                    <span>
                      <i className="fas fa-video mr-1"></i>
                      {media.videos.length}개
                    </span>
                    <span>
                      <i className="fas fa-paw mr-1"></i>
                      {media.animals.length}개
                    </span>
                  </div>
                  {/* 미디어 보기 버튼 */}
                  {(media.images.length > 0 || media.videos.length > 0 || media.animals.length > 0) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMedia(resource);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 mb-2 text-left"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      미디어 보기 ({media.images.length + media.videos.length + media.animals.length}개)
                    </button>
                  )}
                  {/* 리소스에 속한 미디어 미리보기 */}
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {media.images.slice(0, 3).map((img) => {
                      const thumbnailUrl = getResourceThumbnailUrl(img.id, 'image', img.thumbnailPath);
                      return (
                        <div
                          key={img.id}
                          className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100"
                        >
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={img.originalName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-image text-gray-400"></i>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {media.videos.slice(0, 3).map((vid) => {
                      const thumbnailUrl = getResourceThumbnailUrl(vid.id, 'video', vid.thumbnailUrl);
                      return (
                        <div
                          key={vid.id}
                          className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100"
                        >
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={vid.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fas fa-video text-gray-400"></i>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {media.animals.slice(0, 3).map((animal) => {
                      const thumbnailUrl = getResourceThumbnailUrl(animal.id, 'animal', animal.thumbnailUrl);
                      return (
                        <div
                          key={animal.id}
                          className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100"
                        >
                          {thumbnailUrl ? (
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
                              <i className="fas fa-paw text-gray-400"></i>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(media.images.length + media.videos.length + media.animals.length) > 6 && (
                      <div className="w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{media.images.length + media.videos.length + media.animals.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

