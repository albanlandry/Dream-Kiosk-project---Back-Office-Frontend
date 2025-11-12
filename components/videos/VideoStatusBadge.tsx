'use client';

import { Badge } from '@/components/ui/badge';
import type { VideoStatus } from '@/lib/api/videos';

interface VideoStatusBadgeProps {
  status: VideoStatus;
}

export function VideoStatusBadge({ status }: VideoStatusBadgeProps) {
  const variants: Record<VideoStatus, 'default' | 'warning' | 'success' | 'destructive'> = {
    processing: 'warning',
    ready: 'success',
    failed: 'destructive',
  };

  const labels: Record<VideoStatus, string> = {
    processing: 'Processing',
    ready: 'Ready',
    failed: 'Failed',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

