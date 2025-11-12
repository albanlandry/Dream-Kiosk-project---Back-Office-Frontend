'use client';

import { useState } from 'react';
import { useImages, useDeleteImage, useToggleImageActive } from '@/lib/hooks/useImages';
import { ImageCard } from './ImageCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToastStore } from '@/lib/store/toastStore';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ImageList() {
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState<boolean | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useImages(page, limit, activeOnly);
  const deleteImage = useDeleteImage();
  const toggleActive = useToggleImageActive();
  const { showSuccess, showError } = useToastStore();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage.mutateAsync(id);
        showSuccess('Image deleted successfully');
      } catch (err) {
        showError('Failed to delete image');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive.mutateAsync(id);
      showSuccess('Image status updated');
    } catch (err) {
      showError('Failed to update image status');
    }
  };

  // Filter images by search query
  const filteredItems = data?.data?.items?.filter((image) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      image.filename.toLowerCase().includes(query) ||
      image.originalName.toLowerCase().includes(query) ||
      image.description?.toLowerCase().includes(query)
    );
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load images
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Images</h1>
        <div className="flex flex-1 gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeOnly === undefined ? 'default' : 'outline'}
          onClick={() => setActiveOnly(undefined)}
        >
          All
        </Button>
        <Button
          variant={activeOnly === true ? 'default' : 'outline'}
          onClick={() => setActiveOnly(true)}
        >
          Active Only
        </Button>
        <Button
          variant={activeOnly === false ? 'default' : 'outline'}
          onClick={() => setActiveOnly(false)}
        >
          Inactive Only
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>

          {/* Pagination */}
          {!searchQuery && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data?.data?.total_pages || 1}
              </span>
              <Button
                variant="outline"
                disabled={page >= (data?.data?.total_pages || 1)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
    </div>
  );
}

