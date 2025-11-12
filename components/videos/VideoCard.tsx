'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { Trash2, Eye } from 'lucide-react';
import { VideoStatusBadge } from './VideoStatusBadge';

interface VideoCardProps {
  video: Video;
  onDelete: (id: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <VideoStatusBadge status={video.status} />
          <span className="text-xs text-gray-500">Priority: {video.priority}</span>
        </div>
        <h3 className="mb-2 font-semibold">{video.userName}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{video.userMessage}</p>
        {video.payment && (
          <div className="mb-3 rounded bg-gray-50 p-2 text-xs">
            <p className="font-medium">Payment: {video.payment.status}</p>
            <p className="text-gray-600">
              {video.payment.currency} {video.payment.amount}
            </p>
          </div>
        )}
        <p className="mb-4 text-xs text-gray-400">{formatDate(video.createdAt)}</p>
        <div className="flex gap-2">
          <Link href={`/dashboard/videos/${video.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => onDelete(video.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

