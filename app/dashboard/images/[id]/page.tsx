'use client';

import { use } from 'react';
import { useImage } from '@/lib/hooks/useImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize, formatDate } from '@/lib/utils/format';
import { useToggleImageActive, useDeleteImage } from '@/lib/hooks/useImages';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: image, isLoading, error } = useImage(id);
  const toggleActive = useToggleImageActive();
  const deleteImage = useDeleteImage();
  const { showSuccess, showError } = useToastStore();

  const handleToggleActive = async () => {
    if (!image) return;
    try {
      await toggleActive.mutateAsync(image.id);
      showSuccess('Image status updated');
    } catch (err) {
      showError('Failed to update image status');
    }
  };

  const handleDelete = async () => {
    if (!image) return;
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        await deleteImage.mutateAsync(image.id);
        showSuccess('Image deleted successfully');
        router.push('/dashboard/images');
      } catch (err) {
        showError('Failed to delete image');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/images">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Images
          </Button>
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error ? 'Failed to load image' : 'Image not found'}
        </div>
      </div>
    );
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${image.id}`;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/images">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Images
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-square w-full bg-gray-100">
              <img
                src={imageUrl}
                alt={image.filename}
                className="h-full w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Image Details</CardTitle>
                <Badge variant={image.isActive ? 'success' : 'secondary'}>
                  {image.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Filename</p>
                <p className="text-sm">{image.filename}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Original Name</p>
                <p className="text-sm">{image.originalName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">MIME Type</p>
                <p className="text-sm">{image.mimeType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Size</p>
                <p className="text-sm">{formatFileSize(image.size)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dimensions</p>
                <p className="text-sm">
                  {image.width} × {image.height} px
                </p>
              </div>
              {image.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm">{image.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm">{formatDate(image.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-sm">{formatDate(image.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToggleActive}
              className="flex-1"
            >
              {image.isActive ? (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

