'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageType } from '@/types';
import { formatFileSize, formatDate } from '@/lib/utils/format';
import { Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

interface ImageCardProps {
  image: ImageType;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function ImageCard({ image, onDelete, onToggleActive }: ImageCardProps) {
  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${image.id}`;
  const thumbnailUrl = image.thumbnailPath
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}/api/v1/images/${image.id}/thumbnail`
    : imageUrl;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-gray-100">
        <img
          src={thumbnailUrl}
          alt={image.filename}
          className="h-full w-full object-cover"
        />
        <div className="absolute right-2 top-2">
          <Badge variant={image.isActive ? 'success' : 'secondary'}>
            {image.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="truncate font-semibold">{image.originalName}</h3>
        <p className="text-sm text-gray-500">{formatFileSize(image.size)}</p>
        {image.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{image.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{formatDate(image.createdAt)}</p>
        <div className="mt-4 flex gap-2">
          <Link href={`/dashboard/images/${image.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(image.id)}
          >
            {image.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(image.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

