'use client';

import { use } from 'react';
import { useVideo, useUpdateVideoStatus, useUpdateVideoPriority, useDeleteVideo } from '@/lib/hooks/useVideos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/format';
import { useToastStore } from '@/lib/store/toastStore';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { VideoStatusBadge } from '@/components/videos/VideoStatusBadge';
import type { VideoStatus } from '@/lib/api/videos';

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: video, isLoading, error } = useVideo(id);
  const updateStatus = useUpdateVideoStatus();
  const updatePriority = useUpdateVideoPriority();
  const deleteVideo = useDeleteVideo();
  const { showSuccess, showError } = useToastStore();

  const [status, setStatus] = useState<VideoStatus | ''>('');
  const [priority, setPriority] = useState<string>('');

  // Initialize form when video loads
  if (video && status === '' && priority === '') {
    setStatus(video.status);
    setPriority(video.priority.toString());
  }

  const handleStatusUpdate = async () => {
    if (!video || !status) return;
    try {
      await updateStatus.mutateAsync({ id: video.id, status: status as VideoStatus });
      showSuccess('Video status updated');
    } catch (err) {
      showError('Failed to update video status');
    }
  };

  const handlePriorityUpdate = async () => {
    if (!video) return;
    const priorityNum = parseInt(priority, 10);
    if (isNaN(priorityNum)) {
      showError('Invalid priority value');
      return;
    }
    try {
      await updatePriority.mutateAsync({ id: video.id, priority: priorityNum });
      showSuccess('Video priority updated');
    } catch (err) {
      showError('Failed to update video priority');
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await deleteVideo.mutateAsync(video.id);
        showSuccess('Video deleted successfully');
        router.push('/dashboard/videos');
      } catch (err) {
        showError('Failed to delete video');
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

  if (error || !video) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/videos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error ? 'Failed to load video' : 'Video not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/videos">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Videos
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {video.videoUrl ? (
              <video
                src={video.videoUrl}
                controls
                className="w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                <p className="text-gray-500">Video not available</p>
              </div>
            )}
            {video.thumbnailUrl && (
              <div className="mt-4">
                <img
                  src={video.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Video Details</CardTitle>
                <VideoStatusBadge status={video.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">User Name</p>
                <p className="text-sm">{video.userName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Message</p>
                <p className="text-sm">{video.userMessage}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Background Video ID</p>
                <p className="text-sm font-mono text-xs">{video.backgroundVideoId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Priority</p>
                <p className="text-sm">{video.priority}</p>
              </div>
              {video.displayPeriodStart && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Display Period Start</p>
                  <p className="text-sm">{formatDate(video.displayPeriodStart)}</p>
                </div>
              )}
              {video.displayPeriodEnd && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Display Period End</p>
                  <p className="text-sm">{formatDate(video.displayPeriodEnd)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm">{formatDate(video.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-sm">{formatDate(video.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {video.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={video.payment.status === 'completed' ? 'success' : 'warning'}>
                    {video.payment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-sm">
                    {video.payment.currency} {video.payment.amount}
                  </p>
                </div>
                {video.payment.transactionId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="text-sm font-mono text-xs">{video.payment.transactionId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VideoStatus)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <Button onClick={handleStatusUpdate} className="w-full" disabled={!status}>
                <Save className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Priority</label>
                <Input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="Enter priority"
                />
              </div>
              <Button onClick={handlePriorityUpdate} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Update Priority
              </Button>
            </CardContent>
          </Card>

          <Button variant="destructive" onClick={handleDelete} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Video
          </Button>
        </div>
      </div>
    </div>
  );
}

