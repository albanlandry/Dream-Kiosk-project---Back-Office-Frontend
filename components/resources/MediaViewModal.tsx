'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface MediaViewModalProps {
  open: boolean;
  resource: Resource | null;
  onClose: () => void;
}

export function MediaViewModal({
  open,
  resource,
  onClose,
}: MediaViewModalProps) {
  if (!resource) return null;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{resource.name} - 미디어 목록</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 이미지 섹션 */}
            {resource.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-image mr-2"></i>
                  이미지 ({resource.images.length}개)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {resource.images.map((img) => (
                    <div
                      key={img.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-100">
                        {(() => {
                          const thumbnailUrl = getResourceThumbnailUrl(img.id, 'image', img.thumbnailPath);
                          return thumbnailUrl ? (
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
                              <i className="fas fa-image text-gray-400 text-2xl"></i>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {img.originalName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 비디오 섹션 */}
            {resource.videos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-video mr-2"></i>
                  비디오 ({resource.videos.length}개)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resource.videos.map((vid) => (
                    <div
                      key={vid.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-100">
                        {(() => {
                          const thumbnailUrl = getResourceThumbnailUrl(vid.id, 'video', vid.thumbnailUrl);
                          return thumbnailUrl ? (
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
                              <i className="fas fa-video text-gray-400 text-2xl"></i>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800">{vid.userName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 동물 섹션 */}
            {resource.animals && resource.animals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  <i className="fas fa-paw mr-2"></i>
                  동물 ({resource.animals.length}개)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {resource.animals.map((animal) => (
                    <div
                      key={animal.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-100">
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
                              <i className="fas fa-paw text-gray-400 text-2xl"></i>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {animal.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resource.images.length === 0 && resource.videos.length === 0 && (!resource.animals || resource.animals.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                이 리소스에 첨부된 미디어가 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

