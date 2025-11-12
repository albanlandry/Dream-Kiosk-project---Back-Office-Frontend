'use client';

import { useState } from 'react';
import { useVideos, useDeleteVideo } from '@/lib/hooks/useVideos';
import { VideoCard } from './VideoCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToastStore } from '@/lib/store/toastStore';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { VideoStatus } from '@/lib/api/videos';

export function VideoList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<VideoStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useVideos(page, limit, status);
  const deleteVideo = useDeleteVideo();
  const { showSuccess, showError } = useToastStore();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo.mutateAsync(id);
        showSuccess('Video deleted successfully');
      } catch (err) {
        showError('Failed to delete video');
      }
    }
  };

  // Filter videos by search query
  const filteredItems = data?.data?.items?.filter((video) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.userName.toLowerCase().includes(query) ||
      video.userMessage.toLowerCase().includes(query) ||
      video.id.toLowerCase().includes(query)
    );
  });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load videos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Videos</h1>
        <div className="flex flex-1 gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === undefined ? 'default' : 'outline'}
          onClick={() => setStatus(undefined)}
        >
          All
        </Button>
        <Button
          variant={status === 'processing' ? 'default' : 'outline'}
          onClick={() => setStatus('processing')}
        >
          Processing
        </Button>
        <Button
          variant={status === 'ready' ? 'default' : 'outline'}
          onClick={() => setStatus('ready')}
        >
          Ready
        </Button>
        <Button
          variant={status === 'failed' ? 'default' : 'outline'}
          onClick={() => setStatus('failed')}
        >
          Failed
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((video) => (
              <VideoCard key={video.id} video={video} onDelete={handleDelete} />
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
          <p className="text-gray-500">No videos found</p>
        </div>
      )}
    </div>
  );
}

